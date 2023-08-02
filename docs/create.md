# create text sprite

Creates a new TextSprite with the given text. TextSprites can be used with any of the blocks that you can use with a regular [Sprite](/types/sprite). TextSprites have the SpriteKind `FancyText` by default.

```sig
let myTextSprite = fancyText.create("Hello, World!", 100, 1, fancyText.defaultArcade)
```

## Parameters

* **text**: the text for the TextSprite to display
* **maxWidth**: the maximum width the text can occupy. If the text is wider than this width, it will be broken up into multiple lines
* **color**: the color for the text to be drawn in
* **font**: the font to use when drawing the text

### Line breaks

TextSprites are drawn in a single line unless they are given a maximum width. With a maximum width, the text will be broken up into multiple lines automatically based on where spaces occur in the text. You can also force a line break to happen by entering `\n` in the text.

If you need to figure out the actual width or height of the TextSprite after lines have been broken up, use the width/height properties from the Sprites category.

### Font

There are multiple fonts included in the arcade-fancy-text extension for you to choose from. Please note that not every font includes every character; if you're text is failing to properly print with any font try using the "arcade default" or "arcade unicode" fonts instead.

### Tags

Text entered into sprites can also be customized using tags! For example:

```
My favorite color is <red>red</red> today!
```

In the above text, the word "red" will be printed out using red instead of the color that is set on the rest of the text. The tags `<red>` and `</red>` are automatically removed from the text and not drawn to the screen at all.

You can also nest tags to combine effects:

```
<red><wavy>this text is wavy and red</wavy></red>
```

However, some tags cannot be combined (e.g. multiple colors).

#### Color tags

| Tag                           | Effect 
| ----------------------------- | ---------------------------------------
| `white`/`color1`/`c1`         | Prints text in white (color index 1)
| `red`/`color2`/`c2`           | Prints text in red (color index 2) 
| `pink`/`color3`/`c3`          | Prints text in pink (color index 3) 
| `orange`/`color4`/`c4`        | Prints text in orange (color index 4) 
| `yellow`/`color5`/`c5`        | Prints text in yellow (color index 5) 
| `teal`/`color6`/`c6`          | Prints text in teal (color index 6) 
| `green`/`color7`/`c7`         | Prints text in green (color index 7) 
| `blue`/`color8`/`c8`          | Prints text in blue (color index 8) 
| `cyan`/`color9`/`c9`          | Prints text in cyan (color index 9) 
| `purple`/`color10`/`c10`      | Prints text in purple (color index 10) 
| `lightpurple`/`color11`/`c11` | Prints text in light purple (color index 11) 
| `darkpurple`/`color12`/`c12`  | Prints text in dark purple (color index 12) 
| `tan`/`color13`/`c13`         | Prints text in tan (color index 13) 
| `brown`/`color14`/`c14`       | Prints text in brown (color index 14) 
| `black`/`color15`/`c15`       | Prints text in black (color index 15) 
| `rainbow`                     | Prints text in rainbow

#### Font tags

| Tag                           | Effect 
| ----------------------------- | ---------------------------------------
| `small`/`font5`               | Prints text using the "arcade small" font
| `medium`/`font8`              | Prints text using the "arcade default" font
| `large`/`font12`              | Prints text using the "arcade unicode" font


#### Effect tags

| Tag                           | Effect 
| ----------------------------- | ---------------------------------------
| `shake`/`shaky`               | Causes the printed text to shake
| `wave`/`wavy`                 | Causes the printed text to move up and down in a wave motion
| `blink`/`blinking`            | Causes the printed text to blink

#### Animation speed modifiers

These tags can be used to control how quickly text is printed when animating. They only have an effect when characters are being printed using the [animate at speed](./animate-at-speed) or [animate for time](./animate-for time) blocks.

| Tag                           | Effect 
| ----------------------------- | ---------------------------------------
| `veryslow`                    | Slows the animation speed down to 1/12th
| `slow`                        | Slows the animation speed down to 1/4th
| `fast`                        | Ups the animation speed to 2x
| `veryfast`                    | Ups the animation speed to 4x

## Example #example

In this example we create a TextSprite using the "gothic large" font and make it bounce around the screen.


```blocks
let myTextSprite = fancyText.create("Hello World", 100, 1, fancyText.gothic_large)
myTextSprite.setFlag(SpriteFlag.BounceOnWall, true);
myTextSprite.vx = 80;
myTextSprite.vy = 60;
```

```package
arcade-fancy-text=github:riknoll/arcade-fancy-text
```