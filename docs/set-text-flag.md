# set text flag

Enables or disables a flag on a TextSprite. Flags are options that can be used to control how a TextSprite behaves.

```sig
fancyText.setTextFlag(fancyText.create("Hello"), fancyText.Flag.ChangeHeightWhileAnimating, true)
```


## Parameters

* **flag**: the option to enable or disable on the TextSprite
* **on**: a boolean indicating if the option should be enabled or disabled

## Available flags

| Flag                          | Effect 
| ----------------------------- | ---------------------------------------
| change height while animating | When enabled, TextSprites will change height while printing out characters every time a line breaks instead of always using the maximum height. Defaults to ON
| change width while animating  | When enabled, TextSprites will change width while printing out characters every time a new character is printed. This is overridden by "always occupy max width". Defaults to OFF
| always occupy max width       | When enabled, TextSprites will always occupy the max width (if one is set) instead of the minimum width that fits the text. Defaults to ON

## Example #example


```blocks

```

```package
arcade-fancy-text=github:riknoll/arcade-fancy-text
```