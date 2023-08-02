# cancel animation

Cancels any animation started using the [animate at speed](./animate-at-speed) or [animate for time](./animate-for time) blocks.

```sig
fancyText.cancelAnimation(fancyText.create("Hello, World!"))
```

If any calls to [animate at speed](./animate-at-speed) or [animate for time](./animate-for time) are paused waiting for the animation to finish (i.e. with the "until done" option), the pause will be cancelled.

## Example #example


```blocks

```

```package
arcade-fancy-text=github:riknoll/arcade-fancy-text
```