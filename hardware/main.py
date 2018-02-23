import cv2
import numpy as np

# todo use argparse to switch between kinect and webcam

def getKinectImage():
	import freenect

	video,_ = freenect.sync_get_video()
	video = cv2.cvtColor(video,cv2.COLOR_RGB2BGR)

	depth,_ = freenect.sync_get_depth()
	depth = depth.astype(np.uint8)

	return {
		"video": video,
		"depth": depth
	}

def getImage():
	cam = cv2.VideoCapture(0)
	img = cam.read()[1]
	return img

while True:
	img = getKinectImage()["video"]
	edges = cv2.Canny(img, 100,200)

	cv2.imshow('webcam', img)
	cv2.imshow('webcam edges', edges)
	if cv2.waitKey(1) == 27:
		break

cv2.destroyAllWindows()