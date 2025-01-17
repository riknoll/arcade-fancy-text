# draw text

Draws text to an image or the screen. Text passed to this function can use the same tags that the `create text sprite` block uses for customizing the text appearance. See the help for the `create text sprite` block for more information.

```sig
fancyText.draw("Hello, World!", fancyText.getScreen(), 0, 0 100, 1, fancyText.defaultArcade)
```

## Parameters

* **text**: the text to be drawn
* **target**: the image to draw the text to
* **left**: the x value to draw the text at
* **top**: the y value to draw the text at
* **maxWidth**: the maximum width the text can occupy. If the text is wider than this width, it will be broken up into multiple lines
* **color**: the color for the text to be drawn in
* **font**: the font to use when drawing the text

## Example #example

In this example we create a sprite and draw the letter "R" to its image


```blocks
let mySprite = sprites.create(image.create(16, 16), SpriteKind.Player);
fancyText.draw("R", mySprite.image(), 0, 0);
```

```package
arcade-fancy-text=github:riknoll/arcade-fancy-text
```