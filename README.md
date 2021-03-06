# Dentro
## An Outliner with an agenda

### What is an Outliner
According to [Wikipedia](http://wikipedia.org),
an [outliner](http://en.wikipedia.org/wiki/Outliner) is 
>a computer program that allows text to be organized into discrete sections
>that are related in a tree structure or hierarchy.
>Text may be collapsed into a node, or expanded and edited.
>Outliners are typically used for computer programming, collecting or
>organizing ideas, as personal information management or for project management.

I found, during the past year, that for all our attempts to bridge the gap between man and machine,
the most accessible, immediate solution is the tree structure, and its impementations, mostly the outliner.
It fits with the way we think, with the way we organize our thoughs, and, most importantly,
with the way machines "think" and with the way computers organize their data.

### What is Dentro
Dentro is a cross platform single-pane outliner, written in XUL/Javascript and based on Mozilla technology.
It reads from and writes to [OPML](http://dev.opml.org/),
which is a format designed from the ground up to handle
outliners. One of its purposes will be to serve as a project manager/to-do
list.
It also has some other features in the pipeline.

### Why is Dentro
As always, an itch was in need to be scratched, and nothing available was
there to scratch it.
Everything was either too limited, not cross-platform, or non-GUI. I
realised the only way to have my cake and eat
it too will be to design a cake that can be both had and eaten.

### How to run Dentro

!!!Proper Disclosure Alert!!!
Dentro is a work in progress, and until I get some stuff sorted out, this is used as both a personal and project master.
I am not making excuses, more explaining a current situation. To enjoy a buggy, yet working version, please use the
[latest working version](https://github.com/erezschatz/dentro/zipball/master)

You'll need XULrunner (not included), which you can get from
[Mozilla's Site](https://developer.mozilla.org/en-US/docs/XULRunner), or
from your package manager (if you happen to run a distro that happen to have XULRunner packaged, 
like [Debian](http://debian.org).
Once that's installed or unzipped, [download Dentro](https://github.com/erezschatz/dentro/zipball/master), 
then run the following command from a terminal:

	$ [/path/to/]xulrunner /path/to/dentro/application.ini

It should work from windows as well, just replace the paths with the appropriate paths.

### Keyboard Shortcuts:

+ Enter creates an empty sibling node.
+ Tab indents a node under the immediate parent, Shift+Tab indents-out.
+ Alt-Enter expands/collapses the node.
+ Ctrl+Delete deletes the focused node.
+ Down and up arrow moves to the next/previous node
+ 

---
In the future, this will be written in Dentro.
