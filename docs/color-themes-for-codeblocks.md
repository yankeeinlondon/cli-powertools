# Color Themes for Code Blocks

It is common to use a library to parse apart a code block so that the language's structure can be better understood through color. 

- for instance a `function`, a `class` and a `constant` may all have different colors

The process for _colorizing_ the codeblock correctly for the web is typically to parse the block into many `<span>...</span>` blocks with a class attached to indicate the _type_ of symbol that is being represented.

These class names (aka, the target of the parsers blocks) tend to congregate around semi-official standards that grew out of projects like **TextMate** and **Sublime Text** (`.tmTheme` files) and more recently with editors like **VSCode**.


