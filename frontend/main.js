
const formElems = {}
const inputElemIds = ['spaceId', 'clientId']
const elemIds = [
    ... inputElemIds,
    'spaceId', 'startBtn', 'statusLine'
]

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
}

function statusMsg(msg, props) {
    formElems.statusLine.innerText = msg
}

async function onStartClicked() {
    const spaceId = formElems.spaceId.value
    const clientId = formElems.clientId.value

    console.log('onStartClicked')
    
    saveFormToUrlParams()
    
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

    statusMsg('Fetching user details ... IN PROGRESS')

    await fetchUserDetails(clientId, spaceId, userData, groupsData)

    statusMsg('Fetching user details ... DONE')

}

async function fetchUserDetails(clientId, spaceId, userData, groupsData) {
    let i = 0
    for (let u of (userData?.items || [])) {
        i += 1
        let url = `/rest/${clientId}/users/${u.uuid}`

        let userResp = await fetch(url)
        let userDetail = await userResp.json()

        console.log('User Detail', userDetail)

        if (i > 5)
            break
    }

}

export { main }

