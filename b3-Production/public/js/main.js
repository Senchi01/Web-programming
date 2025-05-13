document.addEventListener('DOMContentLoaded', () => {
  // Set the initial background color based on the existing issues
  const issueList = document.getElementById('issueList')
  const issues = issueList.getElementsByTagName('li')
  for (const issue of issues) {
    const state = issue.querySelector('.stateID').textContent.trim()
    if (state.includes('opened')) {
      issue.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'
      issue.classList.add('green')
    } else {
      issue.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
      issue.classList.add('red')
    }
  }
})
/* global io */
const socket = io()
// Listen for the 'issueUpdate' event
socket.on('issueUpdate', (payload) => {
  updateIssueList(payload)
})

/**
 *
 * @param {Array} payload webhook returned data
 */
function updateIssueList (payload) {
  console.log('Updating issue list with:', payload)

  const issueListItem = document.getElementById(`issue${payload.object_attributes.iid}`)

  if (issueListItem) {
    
    if (payload.object_attributes.state_id === 1) {
      issueListItem.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'
      issueListItem.classList.remove('red')
      issueListItem.classList.add('green')
    } else {
      issueListItem.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
      issueListItem.classList.remove('green')
      issueListItem.classList.add('red')
    }
    // Update the content of the existing list item
    issueListItem.innerHTML = `
          <p><strong>Title: </strong>${payload.object_attributes.title}</p>
          <p><strong>Description: </strong>${payload.object_attributes.description}</p>
          <p><strong>State: </strong>${payload.object_attributes.state}</p>
          <p><strong>Creator: </strong>${payload.user.name}</p>
          <a href="${payload.object_attributes.url}">View on Git</a>
      `
  } else {
    const issueList = document.getElementById('issueList')
    
    // If the list item doesn't exist, create a new one and append it to the list
    const li = document.createElement('li')
    li.id = `issue${payload.object_attributes.iid}`
    li.style.listStyle = 'none'
    li.innerHTML = `
          <p><strong>Title: </strong>${payload.object_attributes.title}</p>
          <p><strong>Description: </strong>${payload.object_attributes.description}</p>
          <p><strong>State: </strong>${payload.object_attributes.state}</p>
          <p><strong>Creator: </strong>${payload.user.name}</p>
          <a href="${payload.object_attributes.url}">View on Git</a>
      `

    if (issueList.firstChild) {
      issueList.insertBefore(li,issueList.firstChild)
    }else{
      issueList.appendChild(li)
    }
    if (payload.object_attributes.state_id === 1) {
      li.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'
      li.classList.add('green')
    } else {
      li.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
      li.classList.add('red')
    }
  }
}
