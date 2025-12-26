# My thoughts
These are my thoughts on the video editor.

## Overall Planned Changes
1. Set up eslint/prettier to ensure we are enforcing a style guide/best practices no matter who is touching the code
2. Change global state management over to [redux-toolkit](https://redux-toolkit.js.org/); for the purposes of what this repository is, the small state providers are fine but for larger state management, it becomes cumbersome and a resource drain
3. Unifying types; whether that be something like Protobuf or GraphQL - there would be a different repo that controlled the shape of our data allowing us to generate classes/types for _backend_, _frontend_ and every _end_ in between.
4. Moving rendering to a server. Currently, there is a WASM FFMPEG example in place. This isn't very ideal as it relies on user machine constraints and is single threaded. There are _some_ WASM based improvements that could be made.
5. Of course, adding multiple tracks. This would require a hefty overhaul to existing logic to make sure we handle it properly.

## Suggestions
1. Seeing if white labeling RVE is a viable option; would rather not re-invent the wheel if we can https://www.reactvideoeditor.com/
2. Discussing with team whether using WebGL for some of the processing is viable; maybe some hybrid approach to rendering on the fly is possible.

## What I liked

1. The simplicity of the design is beautiful and not overwhelming
2. Tailwind
3. Radix

If we can avoid re-inventing the wheel, we should. This goes for the packages picked in the repo. Without SIGNIFICANT motivation, I would not try to re-create FFMPEG and I believe that should be a core idea we hold when deciding on technology to use.