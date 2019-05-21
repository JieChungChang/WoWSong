const socket = io('/homepage');
socket.on('connect', function() {
    console.log('socket connect!!');
    socket.emit('homepageEntry');
});
socket.on('getRadioList', function(roomsInfo) {
    console.log(roomsInfo);
    document.getElementById('carouselExampleIndicators').style.display = 'none';
    const carouselInner = document.getElementsByClassName('carousel-inner')[0];
    while (carouselInner.firstChild) {
        carouselInner.removeChild(carouselInner.firstChild);
    }
    const keysArray = Object.keys(roomsInfo);

    for (let i=0; i<keysArray.length; i++) {
        let clientNumber = roomsInfo[keysArray[i]].client.length;
        if ( keysArray[i] === 'fullTimeRadio' && roomsInfo[keysArray[i]].radiohead !== '') {
            clientNumber += 1;
        }
        createRadioRoom(carouselInner, keysArray[i], clientNumber, i===0?'active':'');
    }


    const radioRoomInfo = document.getElementById('radioRoomInfo');
    radioRoomInfo.innerText = ' '+keysArray.length+' 個電台熱播中，一起哈';
});
/**
 * 產生房間列表
 * @param {*} carouselInner
 * @param {*} radiohead
 * @param {*} clients
 * @param {*} active
 */
function createRadioRoom(carouselInner, radiohead, clients, active) {
    const carouselItem = document.createElement('div');
    carouselItem.setAttribute('class', 'carousel-item '+active);

    const carouselCaption= document.createElement('div');
    carouselCaption.setAttribute('class', 'carousel-caption d-none d-md-block');

    const carouselLink= document.createElement('a');
    carouselLink.setAttribute('href', `/playlist/${radiohead}/radio`);

    if (radiohead === 'fullTimeRadio') {
        const carouselImage= document.createElement('img');
        carouselImage.setAttribute('class', 'd-block w-6');
        carouselImage.setAttribute('src', './public/img/vinyl.png');

        carouselLink.appendChild(carouselImage);
        carouselCaption.appendChild(carouselLink);

        const carouseTitle = document.createElement('h5');
        const carouseTitleText = document.createTextNode('24H 排行榜不間斷');
        carouseTitle.appendChild(carouseTitleText);
        carouselCaption.appendChild(carouseTitle);
    } else {
        const carouselImage= document.createElement('img');
        carouselImage.setAttribute('class', 'd-block w-6');
        carouselImage.setAttribute('src', './public/img/user.png');

        carouselLink.appendChild(carouselImage);
        carouselCaption.appendChild(carouselLink);

        const carouseTitle = document.createElement('h5');
        const carouseTitleText = document.createTextNode(radiohead);
        carouseTitle.appendChild(carouseTitleText);
        carouselCaption.appendChild(carouseTitle);
    }

    const carouseP = document.createElement('p');
    const carousePText = document.createTextNode(clients+' 觀眾在線收聽');
    carouseP.appendChild(carousePText);
    carouselCaption.appendChild(carouseP);

    carouselItem.appendChild(carouselCaption);
    carouselInner.appendChild(carouselItem);
}
/**
 *
 */
function toggleRommList() {
    console.log('Click');
    const carouselExampleIndicators = document.getElementById('carouselExampleIndicators');
    const toggleImg = document.getElementById('toggleImg');
    if ( carouselExampleIndicators.style.display==='none' ) {
        carouselExampleIndicators.style.display = 'block';
        toggleImg.setAttribute('scr', 'img/arrow-up.png');
    } else {
        carouselExampleIndicators.style.display = 'none';
        toggleImg.setAttribute('scr', 'img/arrow-down.png');
    }
}
