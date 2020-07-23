(() => {
  const Name = document.querySelector('#name')
  const Email = document.querySelector('#email')
  const Phone = document.querySelector('#phone')
  const Subject = document.querySelector('#subject')
  const Message = document.querySelector('#message')

  const dataStorage = sessionStorage.getItem('@lais:contato');

  if (dataStorage) {
    Name.innerHTML = JSON.parse(dataStorage).name
    Email.innerHTML = JSON.parse(dataStorage).email
    Phone.innerHTML = JSON.parse(dataStorage).phone
    Subject.innerHTML = JSON.parse(dataStorage).subject
    Message.innerHTML = JSON.parse(dataStorage).message
  }

  console.log(JSON.parse(dataStorage))
})()