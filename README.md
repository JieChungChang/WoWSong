# WoWSong
>My AppWorks School personal project - WoWSong https://obeobeko.j-zone.xyz/ 
>This project is just for practcing. It is a clone website of https://www.obeobeko.com. Please use the original obeobeko if you like this porject. 

**WoWSong** is a music sharing platform for people who want to meet friends have the same opinion on music. Via others’ sharing, user can also in touch with the fresh type of music. 

## How It Works
Users share their favorite music by Youtube link and write their comment for it. Video shows on the page with **Youtube Player API** for others looking. 

Users on the WoWSong can like the post, leave their comment on the post, and follow the author. The author can edit, delete the post. All actions above are stored in **MySQL database** and all of the information can be seen by designed **RESTful APIs**.

![Basic](https://user-images.githubusercontent.com/29995663/58178344-9bca0900-7cd8-11e9-9f7e-623683a09467.gif)

## Original Idea - Realtime Mutil-User Radio Station
All posts can be built to a playlist, users can not only listen to playlist alone but open radio station and listen to a playlist with others. In the radio station, song broadcast to every client's browser synchronously by using the **Socket.IO** library.

Demo - Open and Join a radio station
1. Left screen is radio master to open a new radio station
2. Right screen is a radio client join a exist radio station

Demo - Radio master (left screen) broadcast content to client(right screen) synchronously

![Radio1](https://user-images.githubusercontent.com/29995663/58178176-47bf2480-7cd8-11e9-8020-d7e5532f0b44.gif)


## Try It Now
    Test account: test1234
    Test password: testpwd1234

## Tech Stacks and Architecture

![Backend Architecture](https://user-images.githubusercontent.com/29995663/58571234-ec5adc80-826b-11e9-8c5b-81d8008e00a0.png)

* Designed **RESTful APIs** for the client to communicate with the Backend service.
* Built real-time multi-user radio station by **Socket.IO**.
* Used Session with **Redis** to prevent video views cheating.
* Normalized database, added Transaction and added Connection Pool on database query.
* Used **ORM** (Sequelize) design to enhance the readability of code and also prevent SQL injection.
* Stored users' headshot and video snapshot in **AWS S3**  for reducing storage costs.
* Used **AWS CloudFront** CDN to cache user's head shot and post image for decreasing loading latency.
* Used **Nginx** for reverse Proxy server 
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

### Database Normalization
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

RESTful APIs for WoWSong. 
WoWSong have more than 30 APIs. This document only shows part of member and post APIs.  

### Host Name

obeobeko.j-zone.xyz

### API Version

1.0

----

### Member Posts API

* **End Point:** `/post/all`

* **Method:** `GET`

* **Query Parameters**

| Field | Type | Description |
| :---: | :---: | :--- |
| paging | String | Paging for request next page. |

* **Request Example:**

  `https://[HOST_NAME]/api/[API_VERSION]/post/all?paging=0`

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| nextPage | Number | Next page number. If there are no more pages, server will return empty string. |
| rawData | Array | Array of `Post Object`. |

* **Success Response Example:**

```
  "result": {
    "nextPage": 1,
    "rawData": [
      {
        "id": 47,
        "content": "超短音樂，Transaction 測試！！！！！！",
        "title": "超短音樂",
        "picture": "https://s3-us-west-2.amazonaws.com/obeobeko-clone/ytimage/yt-47",
        "account": "jcchang",
        "time": "11:42 May 7, 2019",
        "video_id": "lg1CnjB-E7M",
        "like_count": 2,
        "comment_count": 5,
        "view_times": 126
      },
      {
        "id": 46,
        "content": "Ju 粉通通站起來～！！！",
        "title": "20190323 大港開唱 - 吳卓源 Julia Wu - rgry Talk + 買榜",
        "picture": "https://s3-us-west-2.amazonaws.com/obeobeko-clone/ytimage/yt-46",
        "account": "jcchang",
        "time": "23:22 April 26, 2019",
        "video_id": "3ebIZZQbKkI",
        "like_count": 3,
        "comment_count": 3,
        "view_times": 58
      },
      {
        "id": 44,
        "content": "Ju 粉站出來！",
        "title": "【 走到飛 】- ft. Trout Fresh. ØZI. Julia Wu. Kumachan. B.C.W. Barry. Dwagie （Official Music Video)",
        "picture": "https://i.ytimg.com/vi/Rne4oL1NZrU/hqdefault.jpg",
        "account": "fb_JCC",
        "time": "15:35 April 24, 2019",
        "video_id": "Rne4oL1NZrU",
        "like_count": 1,
        "comment_count": 1,
        "view_times": 20
      }
    ]
  }

```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :--- |
| error | String | Error message. |


* **Error Response Example:**
```
"result": {
    "error": "Unavailable Query String"
  }
```

----

### Member Add New Posts API

* **End Point:** `/post`

* **Method:** `POST`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :--- |
| Content-Type | String | Only accept `application/json`. |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer x48aDD534da8ADSD1XC4SD5S` |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :--- |
| video_id | String | Required. YouTube video Id, server will verify with YouTube Data API|
| content | String | Required and at least 5 words. Comment from the user on the post |

* **Request Body Example:**

```
{
  "video_id": "Rne4oL1NZrU",
  "content": "Ju 粉站出來！",
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| id | Number | Post ID |
| member_account | String | Member who add this post. |
| video_id | String | Verified YouTube video ID. |
| title | String | Video title provided by YouTube Data API. |
| picture | String | YouTube video shapshot URL. |
| content | String | Comment from the user on the post. |
| time | Number | The moment member add new post. Date time number. |
| view_times | Number | Record how many view on this video. |

* **Success Response Example:**

```
result: { 
   "id": 44,
   "member_account": "jcchang",
   "video_id": "Rne4oL1NZrU",
   "title": "【走到飛 】- ft. Trout Fresh. ØZI. Julia Wu. Kumachan. B.C.W. Barry. Dwagie （Official Music Video)",
   "picture": "https://i.ytimg.com/vi/Rne4oL1NZrU/hqdefault.jpg",
   "content": "Ju 粉站出來！",
   "time": 1558515410848,
   "view_times": 0 
 }
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :--- |
| error | String | Error message. |

* **Error Response Example:**
```
{
  "error": "Can't get video title."
}
```

----

### Member Change Posts Content API

* **End Point:** `/post`

* **Method:** `PATCH`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :--- |
| Content-Type | String | Only accept `multipart/form-data`. |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer x48aDD534da8ADSD1XC4SD5S` |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :--- |
| post_id | Number | Required and need to be number. post ID member want to change. |
| content | String | Required and At least 5 words. Comment user want to change to. |
| file | Buffer | Image user want to change the video snapshot.  |

* **Request Body Example:**

```
{
  "post_id": 44,
  "content": "Ju 粉都站不起來！",
  "file": 104, 101, 108, 108...
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| updateResult | Boolean | Result of update post. |
| post_id | Number | ID of updated post. |
| message | String | Update message. |

* **Success Response Example:**

```
result: { 
   "updateResult": true,
   "post_id": 44,
   "message": "Update Post Successfully"
 }
```
```
result: { 
   "updateResult": flase,
   "post_id": 44,
   "message": "Upload to S3 Fail"
 }
```

* **Error Response: 500**

| Field | Type | Description |
| :---: | :---: | :--- |
| error | String | Error message. |

* **Error Response Example:**
```
{
   "updateResult": false, 
   "message": "Error"
}
```

----

### Member Delete Posts API

* **End Point:** `/post`

* **Method:** `DELETE`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :--- |
| Content-Type | String | Only accept `application/json`. |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer x48aDD534da8ADSD1XC4SD5S` |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :--- |
| post_id | Number | Required and need to be number. post ID member want to delete. |

* **Request Body Example:**

```
{
  "post_id": 44
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| result | Boolean | Result of delete post. 
| message | String | Delete message. |

* **Success Response Example:**

```
result: { 
   "updateResult": true,
   "message": "Post 44 had been deleted"
 }
```
```
result: { 
   "updateResult": false,
   "message": "Can not find post"
 }
```

* **Error Response: 500**

| Field | Type | Description |
| :---: | :---: | :--- |
| error | String | Error message. |

* **Error Response Example:**
```
{
   "message": "Delete post failed"
}
```

----

### Member User Sign Up API

* **End Point:** `/member/nativesignin`

* **Method:** `POST`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| name | String | Required. |
| account | String |  Required. |
| mail | String | Required. |
| password | String | Required. |
| passwordConfirm | String | Required. |
| recaptchaRes | String | Required. Client will get recaptcha response string after pass the test. |

* **Request Body Example:**

```
{
   "name": "IamTestUser",
   "account": "test1234",
   "mail": "test.mail@address.com",
   "password": "testpwd1234",
   "passwordConfirm": "testpwd1234",
   "recaptchaRes": "recaptcha response string"
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| signupResult | Boolean | True for user sign up successfully. |
| account | String | Successfully sign up member account. |

| Field | Type | Description |
| :---: | :---: | :--- |
| signupResult | Boolean | False for user sign up failed. |
| status | Number | Sign up fail part. Check status table below. |
| msg | String | Sign up fail reson. |

* **Sign Up Failed Status Table**

| Status | Failed Part |
| :---: | :--- |
| 0 | Name invalidate, cannot input empty string. |
| 1 | Account require at least 6 and less than 15 words without UTF-8 characters. |
| 2 | Email value need to follow right email address format. |
| 3 | Password require at least 6 and less than 20 words include one number and one English alphabet without special characters and UTF-8 characters |
| 4 | Password confirm value need to match password value. |
| 5 | reCAPTCHA test response validate fail or empty value. |

* **Success Response Example:**

```
{
   signupResult: true,
   account: "test1234",
}
```

```
{
   signupResult: false,
   status: 5,
   msg: 'reCAPTCHA 驗證失敗'
}
```

* **Error Response: 500**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |

* **Error Response Example:**
```
{
  "error": "Invalid token."
}
```

----

### Member Change Basic Information API

* **End Point:** `/member/information`

* **Method:** `PATCH`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer x48aDD534da8ADSD1XC4SD5S` |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| name | String | Required. |
| account | String | Required. |

* **Request Body Example:**

```
{
  "name":"anotherTestUser",
  "account":"test1234567",
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| updateResult | Boolean | Result of update basic information. |
| udapteData | Object | Include name and account after sucessfully update. |
| message | String | Information of update. |

| Field | Type | Description |
| :---: | :---: | :--- |
| updateResult | Boolean | Result of update basic information. |
| type | Number | Include name and account after sucessfully update. |
| message | String | Information of update. |


* **Success Response Example:**

```
{
    updateResult: true,
    udapteData: {
        name: name, 
        account: account
    },
    message: 'Update Post Successfully!'
}
```

```
{
   updateResult: false,
   type: 1,
   message: '此帳號已經存在，請重新輸入'
}
```

* **Error Response: 500**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |

* **Error Response Example:**
```
{
  "error": "Unexpect error."
}
```