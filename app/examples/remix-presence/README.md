# Show active user presence (like Google Docs or Figma)

This example covers how to show a presence indicator with a list of the users who are currently viewing a page

- Create a form with an emoji picker
- Use a cookie session storage to save the user's name and emoji.
- Create a full stack component to control the presence widget.
- Use event streams to update the presence widget in real time.

Websockets are also a viable solution here, but that requires setting up a separate websocket server. Server-sent events are easy and widely supported.

- Main blog post: https://www.jacobparis.com/content/remix-presence
- Demo video: https://www.youtube.com/embed/WY1x91Ld-uw
- Live example: https://www.jacobparis.com/content/remix-presence/example
- Example in code: https://github.com/jacobparis-insiders/jacobparis.com/tree/main/app/examples/remix-presence

[![Show active user presence (like Google Docs or Figma)](https://img.youtube.com/vi/WY1x91Ld-uw/0.jpg)](https://www.youtube.com/watch?v=WY1x91Ld-uw "Show active user presence (like Google Docs or Figma)")
