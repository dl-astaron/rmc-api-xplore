
const formElems = {}
const inputElemIds = ['spaceId', 'clientId', 'maxItems', 'objectId', 'editorText']
const elemIds = [
    ... inputElemIds,
    'spaceId', 'startBtn', 'fetchGroupsBtn', 'fetchBrands', 'fetchPubTitles',
    'statusMsgLine', 'objectType',
    'createObjectTypeName', 'createObjectBtn',
    'createBtn', 'updateBtn',
    'clientIdSelect', 'spaceIdSelect', 'brandsSelect',
    'resultsTable', "resultsHeader", "resultsBody", 'copyTableBtn',
    'resultsPanel', 'editorPanel',
]

const headerProps = ['UUID', 'Login', 'Status', 'Name', 'Group Count']

const TypesConfig = {
    User : {
        headerNames: ['UUID', 'Login', 'Status', 'Name', 'Group Count'],
        rowProps: ['uuid', 'login', 'isActive', 'name', 'groups.count']
    },
    Group: {
        headerNames: ['UUID', 'Name', 'Code', 'Member Count','Description', 'cTime', 'mTime'],
        rowProps: ['uuid', 'name', 'codeName', 'members.count', 'description', 'creationDate', 'modificationDate']
    },
    Brand: {
        headerNames: ['UUID', 'Name', 'Short Name', 'Description', 'cTime', 'mTime', 'Creator'],
        rowProps: ['uuid', 'name', 'shortName', 'description', 'creationDate', 'modificationDate', 'author'],
        editableProps: ['name', 'shortName', 'description'],
        editable: true,
        restPath: 'brands',
    },
    PublicationTitle : {
        headerNames: ['UUID', 'Name', 'Short Name', 'Description', 'cTime', 'mTime', 'Creator', 'Is Active'],
        rowProps: ['uuid', 'name', 'shortName', 'description', 'creationDate', 'modificationDate', 'author', 'isActive'],
        editableProps: ['name', 'shortName', 'description', 'publicationChannel', 'isActive', 'accountingIdentifier'],
        editable: true,
        restPath: 'pub-titles',
    }
}

const getTableConfig = (type) => {
    return TypesConfig[type] || null
}

function showPanel(panelId) {
    console.log('showPanel', panelId)

    const panels = ['resultsPanel', 'editorPanel']

    for (let p of panels) {
        if (p === panelId) {
            formElems[p].style.display = 'block'
        } else {
            formElems[p].style.display = 'none'
        }
    }
}

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
    formElems.fetchBrands.addEventListener('click', onFetchBrandsClicked)
    formElems.fetchPubTitles.addEventListener('click', onFetchPubTitlesClicked)
    formElems.clientIdSelect.addEventListener('input', onClientSelected)
    formElems.spaceIdSelect.addEventListener('input', onSpaceSelected)
    formElems.brandsSelect.addEventListener('input', onBrandSelected)
    formElems.createObjectBtn.addEventListener('click', onCreateObjectClicked)
    formElems.createBtn.addEventListener('click', onSaveNewObjectClicked)
    formElems.updateBtn.addEventListener('click', onUpdateObjectClicked)

}

function statusMsg(msg, props) {
    formElems.statusMsgLine.innerText = msg
}

function onClientSelected() {
    console.log('onClientSelected', formElems.clientIdSelect.value)
    let clientId = formElems.clientIdSelect.value
    if (clientId)
        formElems.clientId.value = clientId
}

function onSpaceSelected() {
    console.log('onSpaceSelected', formElems.spaceIdSelect.value)
    let spaceId = formElems.spaceIdSelect.value
    if (spaceId)
        formElems.spaceId.value = spaceId
}

function onBrandSelected() {
    console.log('onBrandSelected', formElems.brandsSelect.value)
    let brandId = formElems.brandsSelect.value

    formElems.fetchPubTitles.disabled = brandId ? false : true

}

async function onStartClicked() {
    const spaceId = formElems.spaceId.value
    const clientId = formElems.clientId.value

    console.log('onStartClicked')
    
    showPanel('resultsPanel')
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

    console.log('onFetchGroupsClicked')
    
    showPanel('resultsPanel')

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
    
    showResultsTable('Group', groupsData.items)
}

async function onFetchBrandsClicked() {
    const clientId = formElems.clientId.value

    console.log('onFetchGroupsClicked')

    showPanel('resultsPanel')
    clrTable()
    saveFormToUrlParams()

    statusMsg('Fetching brands ...')

    let url = `/rest/${clientId}/brands`

    const brandsResp = await fetch(url)
    const brandsData = await brandsResp.json()

    statusMsg('Fetching groups DONE.')

    console.log('Brands', brandsData)

    showResultsTable('Brand', brandsData.items)

    populateBandsSelect(brandsData.items)
}

async function onFetchPubTitlesClicked() {
    const brandId = formElems.brandsSelect.value
    const clientId = formElems.clientId.value

    console.log('onFetchPubTitlesClicked', brandId)

    if (!brandId) 
        return

    let usp = new URLSearchParams()
    usp.set('brandId', brandId)

    showPanel('resultsPanel')
    clrTable()
    saveFormToUrlParams()

    statusMsg('Fetching pub titles ...')

    let url = `/rest/${clientId}/pub-titles` + '?' + usp.toString()

    const fetchResp = await fetch(url)
    const respData = await fetchResp.json()

    statusMsg('Fetching pub titles DONE.')

    console.log('Publ Titles', respData)

    showResultsTable('PublicationTitle', respData.items)
}

async function onCreateObjectClicked() {
    
    const objectType = formElems.createObjectTypeName.innerText
    const restPath = TypesConfig[objectType]?.restPath || null
    const editableProps = TypesConfig[objectType]?.editableProps || null

    if (!restPath) {
        console.error(`No REST path defined for object type: ${objectType}`)
        return
    }
    showPanel('editorPanel')

    let objectData = {}
    for (let p of editableProps) {
        objectData[p] = ''
    }

    const jsonData = JSON.stringify(objectData, null, 2)

    formElems.objectId.value = ''
    formElems.editorText.value = jsonData
}

async function onSaveNewObjectClicked() {
    const objectType = formElems.createObjectTypeName.innerText
    const restPath = TypesConfig[objectType]?.restPath || null
    const clientId = formElems.clientId.value

    if (!restPath) {
        console.error(`No REST path defined for object type: ${objectType}`)
        return
    }

    let objectData = null
    try {
       objectData = JSON.parse(formElems.editorText.value)
    }
    catch (e) {
        console.error('Invalid JSON data:', e)
        statusMsg('Invalid JSON data. Please check the input.')
        return
    }

    if (!objectData) {
        console.error('No object data to save')
        statusMsg('No object data to save. Please check the input.')
        return
    }

    const usp = new URLSearchParams()

    if (objectType === 'PublicationTitle') {
        const brandId = formElems.brandsSelect.value
        usp.set('brandId', brandId)
    }

    statusMsg(`Saving new ${objectType} ...`)

    let url = `/rest/${clientId}/${restPath}/`

    if (usp.toString())
        url += '?' + usp.toString()

    const fetchResp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objectData)
        })

    const respData = await fetchResp.json()

    console.log('Save Response', respData)

    statusMsg(`Saved new ${objectType} ...`)
}

async function onUpdateObjectClicked() {
    const objectId = formElems.objectId.value
    const objectType = formElems.createObjectTypeName.innerText
    const restPath = TypesConfig[objectType]?.restPath || null
    const clientId = formElems.clientId.value

    if (!objectId) {
        console.error('No object ID provided for update')
        statusMsg('No object ID provided for update. Please check the input.')
        return
    }

    if (!restPath) {
        console.error(`No REST path defined for object type: ${objectType}`)
        return
    }

    let objectData = null
    try {
       objectData = JSON.parse(formElems.editorText.value)
    }
    catch (e) {
        console.error('Invalid JSON data:', e)
        statusMsg('Invalid JSON data. Please check the input.')
        return
    }

    if (!objectData) {
        console.error('No object data to save')
        statusMsg('No object data to save. Please check the input.')
        return
    }

    statusMsg(`Saving new ${objectType} ...`)

    let url = `/rest/${clientId}/${restPath}/${objectId}`

    const fetchResp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objectData)
        })

    const respData = await fetchResp.json()

    console.log('Save Response', respData)

    statusMsg(`Saved new ${objectType} ...`)
}

function clrTable() {
    formElems.resultsHeader.innerHTML = ''
    formElems.resultsBody.innerHTML = ''
}

function showResultsTable(objectType, dataItems) {
    clrTable()

    const tableConfig = getTableConfig(objectType)
    if (!tableConfig) {
        console.error(`No table config found for ${objectType}`)
        return
    }

    formElems.resultsHeader.appendChild( headerRow ( tableConfig.headerNames ) )
    formElems.copyTableBtn.style.visibility = 'visible'

    console.log('showResultsTable', objectType, tableConfig)
    if (tableConfig.editable) {
        formElems.createObjectTypeName.innerHTML = objectType
        formElems.createObjectBtn.style.visibility = 'visible'
    }
    else {
        formElems.createObjectBtn.style.visibility = 'hidden'
    }

    let i = 0
    for (let item of dataItems) {
        i += 1
        
        formElems.resultsBody.appendChild(createRowElem(objectType, item))
    }
}


function populateBandsSelect(brands) {
    if (!brands) return

    let options = [
        `<option value=""> --- No Brand Selected (${brands.length} item[s]) ---</option>`
    ]
    for (let b of brands) {
        options.push(
            `<option value="${b.uuid}">${b.name} (${b.shortName})</option>`
        )
    }
    formElems.brandsSelect.innerHTML = options.join('\n')
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

function createRowElem(rowType, rowItem) {
    const tableConfig = getTableConfig(rowType)
    if (!tableConfig) {
        console.error(`No table config found for row type: ${rowType}`)
        return null
    }

    let rowElem = document.createElement('TR')
    let props = tableConfig.rowProps
    for (let p of props) {
        let cellValue = rowItem[p]
        if (['creationDate', 'modificationDate'].includes(p))
            cellValue = cellValue.substring(0, 19) + 'Z'
        if (p === 'isActive')
            cellValue = rowItem[p] ? 'Active' : 'Inactive'
        if (p === 'members.count') 
            cellValue = isNullish(rowItem?.members?.count) ? '' : rowItem.members.count

        const cell = tableCell(cellValue)

        if (tableConfig.editable && p === 'uuid') {
            cell.classList.add('uuid-editable')
            cell.addEventListener('click', () => { editObject(rowType, rowItem.uuid) })
        }
        rowElem.appendChild(cell)
    }

    return rowElem
}

const editObject = async (rowType, objectId) => {
    const restPath = TypesConfig[rowType]?.restPath || null
    const editableProps = TypesConfig[rowType]?.editableProps || null
    if (!restPath) {
        console.error(`No REST path defined for row type: ${rowType}`)
        return
    }

    const clientId = formElems.clientId.value

    console.log(`Editing ${rowType} with ID: ${objectId}`)

    showPanel('editorPanel')

    formElems.objectId.value = objectId
    formElems.objectType.innerText = rowType

    statusMsg(`Fetching ${rowType} with ID: ${objectId}`)

    let url = `/rest/${clientId}/${restPath}/${objectId}`

    const fetchResp = await fetch(url)
    const respData = await fetchResp.json()

    console.log(`${rowType} Data`, respData)

    let editableData = {}

    for (let p of editableProps) {
        if (! respData.hasOwnProperty(p))
            continue
        editableData[p] = respData[p]
    }

    const jsonData = JSON.stringify(editableData, null, 2)

    formElems.editorText.value = jsonData

    statusMsg(`Fetching ${rowType} with ID: ${objectId} DONE`)
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

