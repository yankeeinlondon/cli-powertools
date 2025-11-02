# Word Wrapping

Creating an effective _word wrapping_ strategy for the terminal/console requires that:

- we can detect (and strip) full ANSI escape codes, OSC8 escape codes, and OSC52 escape codes
- we also know how to handle certain characters which require two characters to represent but show only take a single character in the console's viewport.
- we also need to be able to detect 

