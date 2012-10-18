# Dentro
## An Outliner with an agenda

### What is an Outliner
Accouding to (Wikipedia)[http://wikipedia.org], 
an [[http://en.wikipedia.org/wiki/Outliner][outliner]] is a computer 
program that allows text to be organized into discrete sections 
that are related in a tree structure or hierarchy. 
Text may be collapsed into a node, or expanded and edited.
Outliners are typically used for computer programming, collecting or 
organizing ideas, 
as personal information management or for project management.

I found, during the past year, that for all our attempts to bridge the gap between man and machine,
the most accessible, immediate solution is the tree structure, and its impementations, mostly the outliner.
It fits with the way we think, with the way we organize our thoughs, and, most importantly,
with the way machines "think" and with the way computers organize their data.

### What is Dentro
Dentro is a cross platform single-pane outliner, written in XUL/Javascript and based on Mozilla technology. 
It reads from and writes to [[http://dev.opml.org/][OPML]], 
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
You'll need XULrunner (not included), which you can get from  
(Mozilla's Site)[https://developer.mozilla.org/en-US/docs/XULRunnerhh], or 
from your package manager (if you 
happen to run a distro that happen to have XULRunner packaged, like [[http://debian.org][Debian]]).
Once that's installed or unzipped, download dentro (or git-clone it), then run the following from a terminal:

	$ [/path/to/]xulrunner /path/to/dentro/application.ini

It should work from windows as well, just replace the paths with the appropriate paths.

### Keyboard Shortcuts:

Enter creates an empty sibling node.
Tab indents it under the immediate parent, Shift+Tab indents-out.
Alt-Enter expands/collapses the node, you can also Alt-Enter.
Ctrl+delete deletes the focused node.
Down and up arrow moves to the next/previous node

