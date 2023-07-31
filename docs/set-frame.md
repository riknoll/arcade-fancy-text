# set frame

Sets a frame to be drawn around a TextSprite.

```sig
fancyText.setText(fancyText.create("Hello"), "World!")
```

This is similar to the frame used in "show long text" except that the interior of the frame can only be a solid color. Frame images must be square and have a side length that is divisible by 3 (e.g. 12, 15, 30, etc).

Frames are drawn by taking the template image and dividing it into nine parts; the top middle, left middle, right middle, and bottom middle sections are repeated to form the sides of the frame.


## Parameters

* **frame**: the frame template image to set on this TextSprite

## Example #example


```blocks

```

```package
arcade-fancy-text=github:riknoll/arcade-fancy-text
```