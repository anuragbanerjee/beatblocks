import cv2
import numpy as np
import math

def getColorMatchPercentage(color1, color2):
    R = 2* math.pow(color1[0] - color2[0], 2)
    G = 4* math.pow(color1[1] - color2[1], 2)
    B = 3* math.pow(color1[2] - color2[2], 2)

    return 100 - (math.sqrt(R + G + B)/765) * 100

def increase_brightness(img, value=30):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    lim = 255 - value
    v[v > lim] = 255
    v[v <= lim] += value

    final_hsv = cv2.merge((h, s, v))
    img = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return img

def increase_saturation(img, value=30):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    lim = 255 - value
    s[s > lim] = 255
    s[s <= lim] += value

    final_hsv = cv2.merge((h, s, v))
    img = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return img

def displayToScreen(image):
    # DEBUG: Displays the mask to determine block color
    cv2.namedWindow("image", cv2.WINDOW_NORMAL)
    w = int(image.shape[0]/4)
    h = int(image.shape[1]/4)
    cv2.resizeWindow('image', (w, h))
    image = cv2.resize(image, (w, h))
    cv2.imshow("image", image)

def isBlockContour(c):
    isGoodArea = 8000 < cv2.contourArea(c) < 30000

    isGoodPerimeter = 400 < cv2.arcLength(c, True) < 700

    x, y, w, h = cv2.boundingRect(c)
    aspect_ratio = float(w)/h
    isGoodAspectRatio = 0.95 < aspect_ratio < 1.2
    return isGoodArea and isGoodPerimeter and isGoodAspectRatio

def findBlocks(frame, debug=False):
    original = frame.copy()

    frame = cv2.flip(frame, -1)
    output = frame.copy()

    # pop out colors for better color detection
    frame = increase_brightness(frame, 90)
    frame = increase_saturation(frame, 75)

    # thresholding to isolate contours by color range
    gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
    gray = cv2.bilateralFilter(gray, 20, 75, 75)
    _, gray = cv2.threshold(gray, 150, 230, cv2.THRESH_BINARY_INV)

    _, contours, _ = cv2.findContours(gray, 1, 2)
    print(len(contours), "contours detected")

    contours = [c for c in contours if isBlockContour(c)]
    print(len(contours), "good contours detected")
    
    maskOverall = np.zeros(gray.shape, np.uint8)
    id = 1

    blurred = original.copy()

    blocks = []
    for cnt in contours:
        # rotated bounding rectangle
        rect = cv2.minAreaRect(cnt)
        box = cv2.boxPoints(rect)
        box = np.int0(box)

        # basic facts about contour
        area = cv2.contourArea(cnt)
        peri = cv2.arcLength(cnt, True)

        """
        Here, we take samples of pixels around the shape and calculate the
        average color of the block from the samples.
        """
        mask = np.zeros(gray.shape, np.uint8)
        cv2.drawContours(mask,[box],0,(255,255,255), -10)
        num_rows, num_cols = mask.shape[:2]
        translation_matrix = np.float32([[1,  0,   0], [0,  1, -30] ])
        upShiftedMask = cv2.warpAffine(mask, translation_matrix, (num_cols, num_rows))
        mask = cv2.bitwise_and(mask, upShiftedMask)
        mask = cv2.bitwise_not(mask, mask=upShiftedMask)

        cv2.bitwise_not(maskOverall, maskOverall, mask = mask)

        if debug:
            # draw bounding boxes for detected shapes/contours
            cv2.drawContours(output,[box],0,(0, 0, 255), 10)

        # get the average color from the sampled region
        blurred = cv2.GaussianBlur(output, (9, 9), 0)
        blockColor = cv2.mean(blurred, mask)

        # convert from BGR to RGB
        blockColor = (blockColor[2], blockColor[1], blockColor[0])
        if blockColor is (0, 0, 0):
            continue

        """
        Colors from the paint site, converted to RGB
        http://www.montanacolors.com/webapp/spray

        Magenta - #d90075 - (217,0,117)
        Electric blue - #005891 - (0,88,145)
        Lava orange - #ef8407 - (239,132,7)
        Venus violet - #483366 - (72,51,102)
        """
        pink   = (217, 0, 117)
        blue   = (0, 88, 145)
        orange = (239, 132, 7)
        purple = (72, 51, 102)

        colorMatches = {
            "orange": int(getColorMatchPercentage(orange, blockColor)),
            "purple": int(getColorMatchPercentage(purple, blockColor)),
            "blue": int(getColorMatchPercentage(blue, blockColor)),
            "pink": int(getColorMatchPercentage(pink, blockColor))
        }

        colorMatches["blue"] *= 1.2
        colorMatches["purple"] -= 3.5
        # colorMatches["pink"] += 1.5

        predictedColor = max(colorMatches, key=colorMatches.get)

        # determines number of corners in the contour
        approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)
        corners = len(approx)

        # use number of corners to infer shape
        if corners == 3:
            predictedShape = "triangle"
        elif corners == 4:
            predictedShape = "square"
        elif corners == 5:
            predictedShape = "pentagon"
        else:
            predictedShape = "circle"

        try:
            M = cv2.moments(cnt)
            cx = int(M['m10']/M['m00'])
            cy = int(M['m01']/M['m00'])
        except:
            continue


        print("{} {} {}".format(id, predictedColor, predictedShape))
        print("block color", list(map(int, blockColor)))
        print("corners", corners)
        print("area", area)
        print("perimeter", peri)

        x,y,w,h = cv2.boundingRect(cnt)
        aspect_ratio = float(w)/h
        print("aspect ratio", aspect_ratio)
        
        print("color match confidence:", sorted(colorMatches.items(), key=lambda x: -x[1]), "\n")

        if debug:
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(output, str(id), (cx - 50, cy), font, 1.5, (255, 255, 255), thickness = 3)
            cv2.putText(output, predictedColor, (cx - 50, cy + 50), font, 1.5, (255, 255, 255), thickness = 3)
            cv2.putText(output, predictedShape, (cx - 50, cy + 100), font, 1.5, (255, 255, 255), thickness = 3)

        id += 1

        blocks.append({
            "color": predictedColor,
            "shape": predictedShape
        })

        # print(blocks)

    if debug:
        # overlay masks to overall image
        maskOverall = cv2.cvtColor(maskOverall, cv2.COLOR_GRAY2BGR)
        maskOverall = cv2.addWeighted(maskOverall, 0.5, blurred, 0.5, 0)
        # maskOverall = cv2.flip(maskOverall, -1)
        def auto_canny(image, sigma=0.33):
            # compute the median of the single channel pixel intensities
            v = np.median(image)
         
            # apply automatic Canny edge detection using the computed median
            lower = int(max(0, (1.0 - sigma) * v))
            upper = int(min(255, (1.0 + sigma) * v))
            edged = cv2.Canny(image, lower, upper)
         
            # return the edged image
            return edged

        displayToScreen(maskOverall)

    # Displays the output frame
    # cv2.namedWindow("Output", cv2.WINDOW_NORMAL)
    # w = int(output.shape[0]/4)
    # h = int(output.shape[1]/4)
    # cv2.resizeWindow('Output', (w, h))
    # output = cv2.resize(output, (w, h))
    # cv2.imshow("Output", output)

    # Displays the input frame
    # cv2.namedWindow("Input", cv2.WINDOW_NORMAL)
    # w = int(frame.shape[0]/4)
    # h = int(frame.shape[1]/4)
    # cv2.resizeWindow('Input', (w, h))
    # frame = cv2.resize(frame, (w, h))
    # cv2.imshow("Input", frame)

    print("DONE")

    if debug:
        while True:
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    return blocks


"""
Public API functions are below
"""

try:
    from goprocam import GoProCamera
    from goprocam import constants
    gp = GoProCamera.GoPro(mac_address="f6dd9e42f166")
except:
    print("Not connected to GO PRO wifi.")
    
    import sys
    sys.exit(1)

import time
def getBlocks(debug=False):
    '''
    returns something like [
        {
         "color":  "blue",
         "shape":  "triangle"
        },
        {
         "color":  "blue",
         "shape":  "triangle"
        },
        {
         "color":  "blue",
         "shape":  "triangle"
        }
    ]
    '''

    gp.mode(constants.Mode.PhotoMode, constants.Mode.SubMode.Photo.Single)
    gp.shutter(constants.start)
    gp.shutter(constants.stop)
    
    time.sleep(1)

    url = gp.getMedia()
    print(url)

    if len(url) < 1:
        print("URL NOT READY")
        return None

    cap = cv2.VideoCapture(url)
    grabbed, frame = cap.read()

    blocks = None

    if not grabbed:
    	pass
    else:
      blocks = findBlocks(frame, debug=debug)
      gp.delete("all")
      
    cap.release()

    return blocks

def test():
    images = ["IMG_0052.JPG", "IMG_0049.JPG", "IMG_0050.JPG", "IMG_0051.JPG"]
    for fd in images:
        img = cv2.imread(fd)
        findBlocks(img, debug=True)
    cv2.destroyAllWindows()

def testAPI(random=False):
    if random:
        import random
        images = ["IMG_0052.JPG", "IMG_0049.JPG", "IMG_0050.JPG", "IMG_0051.JPG"]
        img = cv2.imread("camera/" + random.choice(images))
        return findBlocks(img)
    else:
        img = cv2.imread("camera/IMG_0052.JPG")
        return findBlocks(img)

if __name__ == '__main__':
    import signal
    import sys
    pressed = False
    def signal_handler(signal, frame):
        global pressed
        if pressed == False:
            gp.delete("last");
            print("DELETING LAST IMAGE")
            sys.exit(0)
            pressed = True
    signal.signal(signal.SIGINT, signal_handler)
    print('Press Ctrl+C to end')

    while True:
        getBlocks(debug=True)