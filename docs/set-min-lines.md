# set min lines

Sets the minimum number of lines to be used when calculating the height of this TextSprite. The sprite can exceed this number of lines if the max width is set and the chosen text cannot fit within this number of lines.

```sig
fancyText.setMinLines(fancyText.create("Hello, World!"), 3)
```

## Parameters

* **sprite**: The sprite to set the min lines on
* **lines**: The minimum number of lines to use in height calculations

## Example #example


```blocks

```

```package
arcade-fancy-text=github:riknoll/arcade-fancy-text
```