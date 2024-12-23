
const formElems = {}
const inputElemIds = ['spaceId', 'clientId', 'maxItems']
const elemIds = [
    ... inputElemIds,
    'spaceId', 'startBtn', 'fetchGroupsBtn', 'statusLine',
    'clientSelect',
    'resultsTable', "resultsHeader", "resultsBody", 'copyTableBtn'
]

const headerProps = ['UUID', 'Login', 'Status', 'Name', 'Group Count']

function saveFormToUrlParams() {
    console.log('submitForm')
    let usp = new URLSearchParams()

    for (let e of inputElemIds) {
        if (! formElems[e].value)
            continue
        usp.set(e, formElems[e].value)
    }

    history.pushState(null, null, `${document.location.pathname}?${usp.toString()}`)
}

function main() {
    for (let e of elemIds) {
        formElems[e] = document.getElementById(e)
    }
    
    let urlParams = new URLSearchParams(document.location.search)
    for (let e of inputElemIds) {
        formElems[e].value = urlParams.get(e) || ''
    }

    formElems.startBtn.addEventListener('click', onStartClicked)
    formElems.copyTableBtn.addEventListener('click', onCopyTableClicked)
    formElems.fetchGroupsBtn.addEventListener('click', onFetchGroupsClicked)
    formElems.clientSelect.addEventListener('input', onClientSelected)
}

function statusMsg(msg, props) {
    formElems.statusLine.innerText = msg
}

function onClientSelected() {
    console.log('onClientSelected', formElems.clientSelect.value)
    let clientId = formElems.clientSelect.value
    if (clientId)
        formElems.clientId.value = clientId
}

async function onStartClicked() {
    const spaceId = formElems.spaceId.value
    const clientId = formElems.clientId.value

    console.log('onStartClicked')
    
    saveFormToUrlParams()
    clrTable()
    
    //RASP client e7f17ebe-51a8-4d6e-8dfe-7a92f627a428
    //fakt space a30bd446-9e79-4839-a7f8-7540bb4f5df4

    statusMsg('Fetching users ...')

    let usp = new URLSearchParams()
    usp.set('space', spaceId)

    let url = `/rest/${clientId}/users` + '?' + usp.toString()

    let usersResp = await fetch(url)
    let userData = await usersResp.json()

    console.log('Users', userData)

    statusMsg('Fetching groups ...')

    url = `/rest/${clientId}/groups` + '?' + usp.toString()

    let groupsResp = await fetch(url)
    let groupsData = await groupsResp.json()

    console.log('Groups', groupsData)

    let groups = groupsData?.items || []

    statusMsg('Fetching user details ... IN PROGRESS')

    formElems.resultsHeader.appendChild( groupHeaderRow (groups, 'codeName', "code") )
    formElems.resultsHeader.appendChild( userGroupsHeaderRow (groups) )
    formElems.copyTableBtn.style.visibility = 'visible'

    await fetchUserDetails(clientId, spaceId, userData, groups)

    statusMsg('Fetching user details ... DONE')

}

async function onFetchGroupsClicked() {
    const spaceId = formElems.spaceId.value
    const clientId = formElems.clientId.value

    console.log('onStartClicked')
    
    saveFormToUrlParams()
    clrTable()

    let usp = new URLSearchParams()
    usp.set('space', spaceId)

    statusMsg('Fetching groups ...')

    let url = `/rest/${clientId}/groups` + '?' + usp.toString()

    let groupsResp = await fetch(url)
    let groupsData = await groupsResp.json()

    statusMsg('Fetching groups DONE.')

    console.log('Groups', groupsData)
    
    let headerNames = ['UUID', 'Name', 'Code', 'Member Count','Description', 'cTime', 'mTime']

    formElems.resultsHeader.appendChild( headerRow (headerNames) )
    formElems.copyTableBtn.style.visibility = 'visible'

    let i = 0
    for (let g of groupsData.items) {
        i += 1
        
        formElems.resultsBody.appendChild(groupRow(g))
    }

}
function clrTable() {
    formElems.resultsHeader.innerHTML = ''
    formElems.resultsBody.innerHTML = ''
}

async function fetchUserDetails(clientId, spaceId, userData, groups) {
    let i = 0
    let maxItems = parseInt(formElems?.maxItems?.value || 0)
    for (let u of (userData?.items || [])) {
        i += 1
        let url = `/rest/${clientId}/users/${u.uuid}`

        let userResp = await fetch(url)
        let userDetail = await userResp.json()

        console.log('User Detail', userDetail)

        formElems.resultsBody.appendChild(userRow(userDetail, spaceId, groups))

        statusMsg(`Fetching user details ... IN PROGRESS  ${i}/${userData.items.length}`)


        if (maxItems > 0 && i >= maxItems)
            break
    }
}

function groupHeaderRow(groups, propName, name) {
    let headerRowElem = document.createElement('TR')

    let headerGroupProps = new Array(headerProps.length - 1).fill('')

    headerGroupProps.push(name)

    for (let p of headerGroupProps) {
        headerRowElem.appendChild(tableCell(p))
    }
    for (let g of groups) {
        headerRowElem.appendChild(tableCell(g[propName]))
    }
    return headerRowElem
}

function headerRow(names) {
    let headerRowElem = document.createElement('TR')

    for (let n of names) {
        headerRowElem.appendChild(tableCell(n, true))
    }
    return headerRowElem
}

function userGroupsHeaderRow(groups) {
    let headerRowElem = document.createElement('TR')

    for (let p of headerProps) {
        headerRowElem.appendChild(tableCell(p, true))
    }
    for (let g of groups) {
        headerRowElem.appendChild(tableCell(g.name, true))
    }
    return headerRowElem
}

function isNullish(s) {
    return s === null || s === undefined
}

function groupRow(group) {
    let groupRowElem = document.createElement('TR')
    let groupProps = ['uuid', 'name', 'codeName', 'members.count', 'description', 'creationDate', 'modificationDate']

    for (let p of groupProps) {
        let cellValue = group[p]
        if (p === 'members.count') 
            cellValue = isNullish(group?.members?.count) ? '' : group.members.count

        if (['creationDate', 'modificationDate'].includes(p))
            cellValue = cellValue.substring(0, 19) + 'Z'

        groupRowElem.appendChild(tableCell(cellValue))
    }

    return groupRowElem
}

function userRow(user, spaceId, groups) {
    let userRowElem = document.createElement('TR')
    let userProps = ['uuid', 'login', 'isActive','name']

    for (let p of userProps) {
        if (p === 'isActive') {
            userRowElem.appendChild(tableCell(user[p] ? 'Active' : 'Inactive'))
            continue
        }
        userRowElem.appendChild(tableCell(user[p]))
    }

    let userGroups = extractUserGroups(user, spaceId) || []
    console.log('User Groups:', userGroups)

    userRowElem.appendChild(tableCell(Object.keys(userGroups).length))

    for (let g of groups) {
        userRowElem.appendChild(tableCell(userGroups[g.uuid] ? "1" : '' ))
    }

    return userRowElem
}

function extractUserGroups(user, spaceId) {
    let userSpaces = []
    for (let rst of user.ringSpaceTypes) {
        if (rst.name === 'Content Space') {
            userSpaces = rst.ringSpaces
            break
        }
    }
    
    let userGroups = []

    for (let us of userSpaces) {
        if (us.uuid === spaceId) {
            userGroups = us.groups
            break
        }
    }

    let userGroupMap = {}
    for (let g of userGroups) {
        userGroupMap[g.uuid] = g
    }

    return userGroupMap
}

function tableCell(value, isHeader) {
    let cell = document.createElement( isHeader ? 'TH' : 'TD' )
    cell.innerText = value
    return cell
}

async function onCopyTableClicked() {
    let tableElem = formElems.resultsTable
    let html = '<TABLE>'
        + tableElem.innerHTML
        + '</HTML>'

    const blob = new Blob([html], {type: 'text/html'});
    const clipboardItem = new window.ClipboardItem({ 'text/html': blob });

    await navigator.clipboard.write([clipboardItem])
    console.log('copied')
}


export { main }

