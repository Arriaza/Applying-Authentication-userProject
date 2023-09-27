const loadInitialTemplate = () => {
  const template = `
		<h1>Animals</h1>
		<form id="animal-form">
			<div>
				<label>Name</label>
				<input name="name" />
			</div>
			<div>
				<label>Type</label>
				<input name="type" />
			</div>
			<button type="submit">Send</button>
		</form>
		<ul id="animal-list"></ul>
	`
  const body = document.getElementsByTagName('body')[0]
  body.innerHTML = template
}

const getAnimals = async () => {
  try {
    const response = await fetch('/animals', {
      headers: {
        Authorization: localStorage.getItem('jwt'),
      },
    });

    if (!response.ok) {
      throw new Error('Server request error');
    }

    const animals = await response.json();
    const template = animal => `
      <li>
        ${animal.name} ${animal.type} <button data-id="${animal._id}">Delete</button>
      </li>
    `;

    const animalList = document.getElementById('animal-list');
    animalList.innerHTML = animals.map(animal => template(animal)).join('');
    animals.forEach(animal => {
      const animalNode = document.querySelector(`[data-id="${animal._id}"]`);
      animalNode.onclick = async e => {
        try {
          await fetch(`/animals/${animal._id}`, {
            method: 'DELETE',
            // headers
            headers: {
              Authorization: localStorage.getItem('jwt')
            }
          });

          animalNode.parentNode.remove();
          alert('Successfully removed');
        } catch (error) {
          console.error('Error deleting animal:', error);
        }
      };
    });
  } catch (error) {
    console.error('API request failed:', error);
  }
};

const addFormListener = () => {
  const animalForm = document.getElementById('animal-form');
  animalForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(animalForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/animals', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('jwt'),
        },
      });

      if (!response.ok) {
        throw new Error('Server request error');
      }

      animalForm.reset();
      getAnimals();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
};

const checkLogin = () => {
  localStorage.getItem('jwt')
}

const animalsPage = () => {
  loadInitialTemplate()
  addFormListener()
  getAnimals()
}

const loadRegisterTemplate = () => {
  const template = `
    <h1>Register</h1>
    <form id="register-form">
      <div>
        <label>E-mail</label>
        <input name="email" />
      </div>
      <div>
        <label>Password</label>
        <input name="password" />
      </div>
      <button type="submit">Submit</button>
    </form>
    <a href='#' id='login'>Login</a>
    <div id='error'></div>
  `
  const body = document.getElementsByTagName('body')[0]
  body.innerHTML = template
}

const gotoLoginListener = () => {
  const gotoLogin = document.getElementById('login')
  gotoLogin.onclick = (e) => {
    e.preventDefault()
    loginPage()
  }
}

const registerPage = () => {
  console.log('Registration page')
  loadRegisterTemplate()
  addRegisterListener()
  gotoLoginListener()
}

const loginPage = () => {
  loadLoginTemplate()
  addLoginListener()
  gotoRegisterListener()
}

const loadLoginTemplate = () => {
  const template = `
    <h1>Login</h1>
    <form id="login-form">
      <div>
        <label>E-mail</label>
        <input name="email" />
      </div>
      <div>
        <label>Password</label>
        <input type='password' name="password" />
      </div>
      <button type="submit">Submit</button>
    </form>
    <a href='#' id='register'>Register</a>
    <div id='error'></div>
  `
  const body = document.getElementsByTagName('body')[0]
  body.innerHTML = template
}

const gotoRegisterListener = () => {
  const gotoRegister = document.getElementById('register')
  gotoRegister.onclick = (e) => {
    e.preventDefault()
    registerPage()
  }
}

const authListener = (action) => {
  const form = document.getElementById(`${action}-form`)
  form.onsubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    const response = await fetch(`/${action}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    const responseData = await response.text()
    if (response.status >= 300) {
      const errorNode = document.getElementById('error')
      errorNode.innerHTML = responseData
    } else {
      // console.log(responseData)
      localStorage.setItem('jwt', `Bearer ${responseData}`)
      animalsPage()
    }
  }
}

const addLoginListener = () => authListener('login')
const addRegisterListener = () => authListener('register')

window.onload = () => {
  const isLoggedIn = checkLogin()
  if (isLoggedIn) {
    animalsPage()
  } else {
    loginPage()
  }
}
