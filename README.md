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

Demo - Open and Join a radio station
Left screen is radio master to open a new radio station
Right screen is a radio client join a exist radio station
![Radio1](https://user-images.githubusercontent.com/29995663/58114212-dc1e7e00-7c29-11e9-8c41-9849d50d0d72.gif)

Demo - Radio master (left screen) broadcast content to client(right screen) synchronously
![Radio2](https://user-images.githubusercontent.com/29995663/58114253-fc4e3d00-7c29-11e9-8755-f8a5670e5054.gif)


## Try It Now
    Test account: test1234
    Test password: testpwd1234

## Tech Stacks and Architecture
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
<img width="792" alt="Backend Architecture" src="https://user-images.githubusercontent.com/29995663/58113722-c2306b80-7c28-11e9-9eeb-94cb31b4b78a.png">

## Database Schema
![Database structure](https://user-images.githubusercontent.com/29995663/58114694-e4c38400-7c2a-11e9-9b63-c35f2870a8ae.png)