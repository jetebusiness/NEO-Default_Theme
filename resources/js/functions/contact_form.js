$(document).ready(function(){
const form = document.getElementById('contato_teste');
form.onsubmit = getDataInputs;

const inputName = document.querySelector('input[name=name]')
const inputEmail = document.querySelector('input[name=email]')
const inputPhone = document.querySelector('input[name=phone]')
const inputSubject = document.querySelector('input[name=subject]')
const inputMessage = document.querySelector('textarea[name=message]')


function getStorageinfo() {
  const dataStorage = sessionStorage.getItem('@lais:contato');

  if (dataStorage && inputName) {
    inputName.value = JSON.parse(dataStorage).name
    inputEmail.value = JSON.parse(dataStorage).email
    inputPhone.value = JSON.parse(dataStorage).phone
    inputSubject.value = JSON.parse(dataStorage).subject
    inputMessage.value = JSON.parse(dataStorage).message
  }
}

getStorageinfo()
})

function getDataInputs(e) {

  e.preventDefault()

  const inputName = document.querySelector('input[name=name]')
  const inputEmail = document.querySelector('input[name=email]')
  const inputPhone = document.querySelector('input[name=phone]')
  const inputSubject = document.querySelector('input[name=subject]')
  const inputMessage = document.querySelector('textarea[name=message]')
  
  const formData = {
    name: inputName.value,
    email: inputEmail.value,
    phone: inputPhone.value,
    subject: inputSubject.value,
    message: inputMessage.value
  }

  sessionStorage.setItem('@lais:contato', JSON.stringify(formData))

  console.log(formData)  

  window.location = 'storage'
  //return formData
}