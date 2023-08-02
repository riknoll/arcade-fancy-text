# set animation sound

Sets a sound to play every time this TextSprite prints a character for an animation started using the [animate at speed](./animate-at-speed) or [animate for time](./animate-for-time) blocks. The sound can be any Playable, including a sound effect, melody, song, or tone.

```sig
fancyText.setAnimationSound(fancyText.create("Hello"), music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear))
```

## Parameters

* **sound**: the sound to play when a charater is printed

## Example #example


```blocks

```

```package
arcade-fancy-text=github:riknoll/arcade-fancy-text
```