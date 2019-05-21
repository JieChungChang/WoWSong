# WoWSong
>My AppWorks School personal project - WoWSong https://obeobeko.j-zone.xyz/ 
>This project is just for practcing. It is a clone website of https://www.obeobeko.com. Please use the original obeobeko if you like this porject. 

**WoWSong** is a music sharing platform for people who want to meet friends have the same opinion on music. Via others’ sharing, user can also in touch with the fresh type of music. 

## How It Works
Users share their favorite music by Youtube link and write their comment for it. Video shows on the page with **Youtube Player API** for others looking. 

Users on the WoWSong can like the post, leave their comment on the post, and follow the author. The author can edit, delete the post. All actions above are stored in **MySQL database** and all of the information can be seen by designed **RESTful APIs**.
<div style="width:100%;height:0;padding-bottom:63%;position:relative;"><iframe src="https://giphy.com/embed/c6WrK4jrngzo0PW9x2" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/c6WrK4jrngzo0PW9x2">via GIPHY</a></p>


## Original Idea - Realtime Mutil-User Radio Station
All posts can be built to a playlist, users can not only listen to playlist alone but open radio station and listen to a playlist with others. In the radio station, song broadcast to every client's browser synchronously by using the **Socket.IO** library.
<div style="width:100%;height:0;padding-bottom:63%;position:relative;"><iframe src="https://giphy.com/embed/39jN2ft0DabsXYQIoG" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/39jN2ft0DabsXYQIoG">via GIPHY</a></p>
<div style="width:100%;height:0;padding-bottom:63%;position:relative;"><iframe src="https://giphy.com/embed/YUxfPlA5ox8wX0Nlog" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/YUxfPlA5ox8wX0Nlog">via GIPHY</a></p>

## Try It Now
    Test account: test1234
    Test password: testpwd1234

## Tech Stacks
* Designed RESTful APIs for the client to communicate with the Backend service.
* Built real-time multi-user radio station by Socket.IO.
* Used Session with Redis to prevent video views cheating.
* Normalized database, added Transaction and added Connection Pool on database query.
* Used ORM (Sequelize) design to enhance the readability of code and also prevent SQL injection.
* Stored users' headshot and video snapshot in AWS S3  for reducing storage costs.
* Third-Party APIs:
    1. Supports Facebook / Google Login
    2. Detects abusive traffic with reCAPTCHA API
    3. Sends member validation mail with Gmail API
    4. Supports YouTube Player API on browser
    5. Gets video information from YouTube Data API
