/**
 * 
 * @param {*} name 
 * @param {*} account 
 * @param {*} node 
 */
function addDropdownList(name, account, node) {
    const dropdownList = document.createElement('li');
    dropdownList.setAttribute('class', 'nav-item dropdown');

    const dropdownListName = document.createElement('a');
    dropdownListName.setAttribute('class', 'nav-link dropdown-toggle');
    dropdownListName.href = '#';
    dropdownListName.id='navbarDropdownMenuLink';
    dropdownListName.setAttribute('role', 'button');
    dropdownListName.setAttribute('data-toggle', 'dropdown');
    dropdownListName.setAttribute('aria-haspopup', 'true');
    dropdownListName.setAttribute('aria-expanded', 'false');

    const dropdownListNameText = document.createTextNode(name);
    dropdownListName.appendChild(dropdownListNameText);

    dropdownList.appendChild(dropdownListName);


    const dropdownMenu = document.createElement('div');
    dropdownMenu.setAttribute('class', 'dropdown-menu');
    dropdownMenu.setAttribute('aria-labelledby', 'navbarDropdownMenuLink');


    const dropdownMenuItemLink1 = document.createElement('a');
    const dropdownMenuItemText1 = document.createTextNode('個人首頁');

    dropdownMenuItemLink1.appendChild(dropdownMenuItemText1);

    dropdownMenuItemLink1.href='/post/member?account='+account;
    dropdownMenuItemLink1.setAttribute('class', 'dropdown-item');

    dropdownMenu.appendChild(dropdownMenuItemLink1);


    const dropdownMenuItemLink2 = document.createElement('a');
    const dropdownMenuItemText2 = document.createTextNode('個人帳戶');

    dropdownMenuItemLink2.appendChild(dropdownMenuItemText2);
    dropdownMenuItemLink2.href='/member';
    dropdownMenuItemLink2.setAttribute('class', 'dropdown-item');

    dropdownMenu.appendChild(dropdownMenuItemLink2);

    const dropdownMenuItemLink3 = document.createElement('a');
    const dropdownMenuItemText3 = document.createTextNode('登出');
    dropdownMenuItemLink3.setAttribute('class', 'dropdown-item');
    dropdownMenuItemLink3.appendChild(dropdownMenuItemText3);
    dropdownMenuItemLink3.setAttribute('onclick', 'logout()');

    dropdownMenu.appendChild(dropdownMenuItemLink3);

    dropdownList.appendChild(dropdownMenu);

    node.parentNode.replaceChild(dropdownList, node);
}
/**
 * 
 */
function logout() {
    console.log('test');
    delCookie('access_token');
    window.location='/';
}
/**
 * 
 * @param {*} name 
 */
function delCookie(name) {
    document.cookie = document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};