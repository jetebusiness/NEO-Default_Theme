$(document).ready(function(){
(() => {
  const Name = document.querySelector('input[name=name]')
  const Email = document.querySelector('input[name=email]')
  const Phone = document.querySelector('input[name=phone]')
  const Subject = document.querySelector('input[name=subject]')
  const Message = document.querySelector('textarea[name=message]')

  const dataStorage = sessionStorage.getItem('@lais:contato');

  if (dataStorage) {
    Name.value = JSON.parse(dataStorage).name
    Email.value = JSON.parse(dataStorage).email
    Phone.value = JSON.parse(dataStorage).phone
    Subject.value = JSON.parse(dataStorage).subject
    Message.value = JSON.parse(dataStorage).message
  }

  console.log(JSON.parse(dataStorage))
})()
})