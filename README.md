# WoWSong
>My AppWorks School personal project - WoWSong https://obeobeko.j-zone.xyz/ 
>This project is just for practcing. It is a clone website of https://www.obeobeko.com. Please use the original obeobeko if you like this porject. 

**WoWSong** is a music sharing platform for people who want to meet friends have the same opinion on music. Via others’ sharing, user can also in touch with the fresh type of music. 

## How It Works
Users share their favorite music by Youtube link and write their comment for it. Video shows on the page with **Youtube Player API** for others looking. 

Users on the WoWSong can like the post, leave their comment on the post, and follow the author. The author can edit, delete the post. All actions above are stored in **MySQL database** and all of the information can be seen by designed **RESTful APIs**.


## Original Idea - Realtime Mutil-User Radio Station
All posts can be built to a playlist, users can not only listen to playlist alone but open radio station and listen to a playlist with others. In the radio station, song broadcast to every client's browser synchronously by using the **Socket.IO** library.

Demo - Open and Join a radio station
1. Left screen is radio master to open a new radio station
2. Right screen is a radio client join a exist radio station

![Radio1](https://user-images.githubusercontent.com/29995663/58114212-dc1e7e00-7c29-11e9-8c41-9849d50d0d72.gif)

Demo - Radio master (left screen) broadcast content to client(right screen) synchronously

![Radio2](https://user-images.githubusercontent.com/29995663/58114253-fc4e3d00-7c29-11e9-8755-f8a5670e5054.gif)


## Try It Now
    Test account: test1234
    Test password: testpwd1234

## Tech Stacks and Architecture

![Backend Architecture](https://user-images.githubusercontent.com/29995663/58113722-c2306b80-7c28-11e9-9eeb-94cb31b4b78a.png)

* Designed RESTful APIs for the client to communicate with the Backend service.
* Built real-time multi-user radio station by Socket.IO.
* Used Session with Redis to prevent video views cheating.
* Normalized database, added Transaction and added Connection Pool on database query.
* Used ORM (Sequelize) design to enhance the readability of code and also prevent SQL injection.
* Stored users' headshot and video snapshot in AWS S3  for reducing storage costs.
* Used Nginx for reverse Proxy server 
* Third-Party APIs:
    1. Supports Facebook / Google Login
    2. Detects abusive traffic with reCAPTCHA API
    3. Sends member validation mail with Gmail API
    4. Supports YouTube Player API on browser
    5. Gets video information from YouTube Data API
    6. Supports Facebook Sharing
    7. Follows Google coding style

## Database Schema
![Database structure](https://user-images.githubusercontent.com/29995663/58114694-e4c38400-7c2a-11e9-9b63-c35f2870a8ae.png)

###Database Normalization
* member table (FK: id)
    1. One member has many posts
    2. One member can like many posts (many to many rule see member_like table)
    3. One member follows many members
    4. One member have many comments

* post table(FK: id, PK1: member_account)
    1. One post belongs to a member
    2. One post have many comments
    3. One post have many likes

* member_like table (FK: id, PK1: post_id, PK2: member_account)
    1. One member_like belongs to a member  
    2. One member_like belongs to a post  

* comment table(FK: id, PK1: post_id, PK2: member_account)
    1. One comment belongs to a post
    2. One comment belongs to a member

* follow table(FK: id, PK1: acoount, PK2: follow_account)
    1. One follow belongs to a member
    2. One follow belongs to a follower

# WoWSong-API-Doc

### Host Name

obeobeko.j-zone.xyz

### API Version

1.0

----