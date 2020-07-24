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

  if (inputName){    
    inputName.addEventListener('change', onChangeInput);
    inputEmail.addEventListener('change', onChangeInput);
    inputPhone.addEventListener('change', onChangeInput);
    inputSubject.addEventListener('change', onChangeInput);
    inputMessage.addEventListener('change', onChangeInput);

    if (dataStorage) {
      inputName.value = JSON.parse(dataStorage).name
      inputEmail.value = JSON.parse(dataStorage).email
      inputPhone.value = JSON.parse(dataStorage).phone
      inputSubject.value = JSON.parse(dataStorage).subject
      inputMessage.value = JSON.parse(dataStorage).message
    }

    try{
    document.querySelector('#name').innerHTML = inputName.value
    document.querySelector('#email').innerHTML = inputEmail.value
    document.querySelector('#phone').innerHTML = inputPhone.value
    document.querySelector('#subject').innerHTML = inputSubject.value
    document.querySelector('#message').innerHTML = inputMessage.value 
    }catch(e){
      console.error(e)
    }   
  }
}

getStorageinfo()
})

function onChangeInput(e){
  const target = e.target
  const element = document.querySelector("#"+target.name)
  element.innerHTML = target.value
}

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