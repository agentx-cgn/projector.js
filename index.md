

Purpose

Editing a Show

Dependencies

-- Mousetrap
	handles key events and sequences

-- jQuery
	to handle the audio selector

Browser support

-- not tested with Opera, IE, Safari
-- Firefox does not play mp4
-- Choose Chrome

Audio Support

-- only available on Chrome
-- How to make a play list
	Due to security reasons the browser will not tell any web application anything about your file system. To circumvent this restriction you can create a simple list of mp3 files you like to import and drop this list onto the AudioSelector.

Hardware Support

-- make sure to get full hardware supprt
-- check chrome://gpu

	the demos have been designed to run on a Linux Netbook with 1024x600 pixels,
	an Intel graphics chip and 1,667Mhz CPU with 30 frames per second. They perform
	considerably better on a Windows desktop machine


Keyboard Shortcuts

Tips & Tricks

-- Running locally

	chrome --allow-file-access-from-files

	$ cd /home/somedir
	$ python -m SimpleHTTPServer

	http://localhost:8000/projector.html

	http://www.linuxjournal.com/content/tech-tip-really-simple-http-server-python

-- Encoding Videos
	It depends on your footage which quality will run on the screen. 

	http://forum.doom9.org/archive/index.php/t-138245.html
	http://ffmpeg.org/ffmpeg.html
	http://mewiki.project357.com/wiki/X264_Settings#Frame-type_options
	!!! https://www.virag.si/2012/01/web-video-encoding-tutorial-with-ffmpeg-0-9/


	ffmpeg -i "best400x300.huff.avi" -an -r 30 -vcodec libx264 -x264opts keyint=1:min-keyint=2 "flashy.mp4"

ffmpeg -i "best400x300.huff.avi" -an -r 30  -vcodec libtheora -qscale 1 "flashy.ogg"


	ffmpeg -i "facity-256.huff.avi"  -an -r 30 -vcodec libx264 -x264opts keyint=1:min-keyint=2 "faces.mp4"
	
	ffmpeg -i "noise.mp4"            -an -r 30 -vcodec libx264 -x264opts keyint=1:min-keyint=2 scale=400x300 "noise.mp4"


http://git-scm.com/docs

-- ignore
noiv@T1667:~$ git config --global user.name "noiv"
noiv@T1667:~$ git config --global user.email "noiv11@gmail.com"
noiv@T1667:~$ git config --global credential.helper cache
noiv@T1667:~$ git config --global credential.helper 'cache --timeout=3600'

noiv@T1667:~$ git config --list
user.name=noiv
user.email=noiv11@gmail.com
credential.helper=cache --timeout=3600

git remote add pjs https://github.com/noiv/projector.js.git

git add UNLICENSE
git add favicon.ico
git add projector.css
git add projector.html