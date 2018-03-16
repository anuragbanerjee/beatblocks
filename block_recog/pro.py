import cv2
import numpy as np
import math

def midpoint(x1, y1, x2, y2):
    x = (x1 + x2)/2
    y = (y1 + y2)/2
    return (x, y)

def sort_contours(cnts, method="left-to-right"):
    # initialize the reverse flag and sort index
    reverse = False
    i = 0
 
    # handle if we need to sort in reverse
    if method == "right-to-left" or method == "bottom-to-top":
        reverse = True
 
    # handle if we are sorting against the y-coordinate rather than
    # the x-coordinate of the bounding box
    if method == "top-to-bottom" or method == "bottom-to-top":
        i = 1
 
    # construct the list of bounding boxes and sort them from top to
    # bottom
    boundingBoxes = [cv2.boundingRect(c) for c in cnts]
    (cnts, boundingBoxes) = zip(*sorted(zip(cnts, boundingBoxes),
        key=lambda b:b[1][i], reverse=reverse))
 
    # return the list of sorted contours and bounding boxes
    return cnts

def sigmoid(x):
  return 1 / (1 + math.exp(-x))

def getColorMatchPercentage(color1, color2):
    R = 2* math.pow(color1[0] - color2[0], 2)
    G = 4* math.pow(color1[1] - color2[1], 2)
    B = 3* math.pow(color1[2] - color2[2], 2)

    return 100 - (math.sqrt(R + G + B)/765) * 100

def findBlocks(frame):
    original = frame.copy()
    gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
    
    gray = cv2.bilateralFilter(gray, 20, 75, 75)
    ret, gray = cv2.threshold(gray, 225, 255, cv2.THRESH_BINARY_INV)

    output = frame.copy()
    _, contours, _ = cv2.findContours(gray, 1, 2)
    contours = [c for c in contours if 500 < cv2.contourArea(c) < 25000]
    
    maskOverall = np.zeros(gray.shape, np.uint8)
    for cnt in sort_contours(contours):
        # rotated bounding rectangle
        rect = cv2.minAreaRect(cnt)
        box = cv2.boxPoints(rect)
        box = np.int0(box)

        """
        Here, we take samples of pixels around the shape and calculate the
        average color of the block from the samples.
        """
        mask = np.zeros(gray.shape, np.uint8)
        cv2.drawContours(mask,[box],0,(255,255,255), -10)
        num_rows, num_cols = mask.shape[:2]
        translation_matrix = np.float32([
            [1,  0, -20],
            [0,  1, 20]
        ])
        shiftedMask = cv2.warpAffine(mask, translation_matrix, (num_cols, num_rows))
        mask = cv2.bitwise_and(mask, shiftedMask)
        mask = cv2.bitwise_not(mask, mask=shiftedMask)

        # add this mask to the overall mask, useful for debugging
        cv2.bitwise_not(maskOverall, maskOverall, mask = mask)

        # get the average color from the sampled region
        blurred = cv2.GaussianBlur(output, (3, 3), 0)
        blockColor = cv2.mean(blurred, mask)

        # draw bounding boxes for detected shapes/contours
        # cv2.drawContours(output,[box],0,(0, 0, 255), 10)

        # convert from BGR to RGB
        blockColor = (blockColor[2], blockColor[1], blockColor[0])

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

        predictedColor = max(colorMatches, key=colorMatches.get)

        # determines number of corners in the contour
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)
        corners = len(approx)

        # use number of corners to infer shape
        if corners == 3:
            predictedShape = "triangle"
        elif corners == 4:
            predictedShape = "square"
        elif corners > 4:
            predictedShape = "circle"
        else:
            predictedShape = '??????'


        # highest point in bounding rect
        topX, topY = max(box, key=lambda b: b[1])

        M = cv2.moments(cnt)
        cx = int(M['m10']/M['m00'])
        cy = int(M['m01']/M['m00'])

        print("{} {}".format(predictedColor, predictedShape))
        print("block color", list(map(int, blockColor)))
        print("color match confidence:", sorted(colorMatches.items(), key=lambda x: -x[1]), "\n")

        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(output, predictedColor, (cx - 50, cy + 150), font, 1.2, (255, 255, 255), thickness = 4)
        cv2.putText(output, predictedShape, (cx - 50, cy + 200), font, 1.2, (255, 255, 255), thickness = 4)

    # overlay masks to overall image
    maskOverall = cv2.cvtColor(maskOverall, cv2.COLOR_GRAY2BGR)
    maskOverall = cv2.addWeighted(maskOverall, 0.7, output, 0.3, 0)

    # DEBUG: Display to mask to determine block color
    cv2.namedWindow("maskOverall", cv2.WINDOW_NORMAL)
    w = int(maskOverall.shape[0]/4)
    h = int(maskOverall.shape[1]/4)
    cv2.resizeWindow('maskOverall', (w, h))
    maskOverall = cv2.resize(maskOverall, (w, h))
    cv2.imshow("maskOverall", maskOverall)


    print("DONE")
    
    # Display the output frame
    # cv2.namedWindow("Output", cv2.WINDOW_NORMAL)
    # w = int(output.shape[0]/4)
    # h = int(output.shape[1]/4)
    # cv2.resizeWindow('Output', (w, h))
    # output = cv2.resize(output, (w, h))
    # cv2.imshow("Output", output)

    # Display the input frame
    # cv2.namedWindow("Input", cv2.WINDOW_NORMAL)
    # w = int(frame.shape[0]/4)
    # h = int(frame.shape[1]/4)
    # cv2.resizeWindow('Input', (w, h))
    # frame = cv2.resize(frame, (w, h))
    # cv2.imshow("Input", frame)

    while True:
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# from goprocam import GoProCamera
# from goprocam import constants
# gp = GoProCamera.GoPro()

# gp.take_picture();

# url = gp.getMedia()
# cap = cv2.VideoCapture(url)

# grabbed, frame = cap.read()
# if not grabbed:
# 	continue
# else:
#   findBlocks(frame)

# cap.release()
# gp.delete("last");

images = ["IMG_0052.JPG", "IMG_0049.JPG", "IMG_0050.JPG", "IMG_0051.JPG"]

for fd in images:
    img = cv2.imread(fd)
    findBlocks(img)

cv2.destroyAllWindows()