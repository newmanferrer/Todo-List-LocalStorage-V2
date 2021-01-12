/* eslint-disable max-len */
//* UBICACIÓN DE ELEMENTOS HTML, CREACIÓN DE CONSTANTES Y VARIABLES
//* ============================================================================================= */
const form = document.getElementById('form');
const divColors = document.getElementById('div-colors');
const containerTasks = document.getElementById('container-tasks');
const containerMessages = document.getElementById('container-messages');
const messagesParagraph = document.getElementById('messages-paragraph');
const inputDate = document.getElementById('input-date');
const ids = [];
let selectedColor;
let arrayTasks = [];
let arrayMessages = [];
let interval;
//* ============================================================================================= */

//* FUNCIONES
//* ============================================================================================= */
//* 1.- FUNCIÓN QUE GENERA UN ID
//*     Genera un id númerico de 13 digitos y comprueba que no se generen ids repetidos
//* ---------------------------------------------------------------------------------------------
const generateId = (() => {
  const id = Math.random().toString(16).substr(2);
  const exists = ids.find((i) => i === id);
  if (exists === undefined) { ids.push(id); } else { generateId(); }
  return id;
});
//* ---------------------------------------------------------------------------------------------

//* 2.- FUNCIÓN QUE AGREGA CEROS ANTES DEL MES Y DIA DE SER NECERSARIO
//* ---------------------------------------------------------------------------------------------
const addZero = ((time) => time.toString().padStart(2, '00'));
//* ---------------------------------------------------------------------------------------------

//* 3.- FUNCIÓN QUE RESTRINGE LA SELECCIÓN DE FECHAS EN EL INPUT DATE
//* ---------------------------------------------------------------------------------------------
const restrictDate = (() => {
  const [fullDate, fullTime] = new Date().toLocaleString().split(' ');
  const [day, month, year] = fullDate.split('/');
  const [hour, minute] = fullTime.split(':');

  return `${year}-${addZero(month)}-${addZero(day)}T${hour}:${minute}`;
});

inputDate.setAttribute('min', restrictDate());
//* ---------------------------------------------------------------------------------------------

//* 4.- FUNCIÓN QUE COMPARA Y VALIDA LA FECHA
//* ---------------------------------------------------------------------------------------------
const compareDates = ((inputDateValue) => {
  let compareResult;
  const currentDate = restrictDate();

  if (inputDateValue < currentDate) {
    compareResult = true;
  } else {
    compareResult = false;
  }
  return compareResult;
});
//* ---------------------------------------------------------------------------------------------

//* 5.- FUNCIÓN QUE VALIDA LOS DATOS DE LA TAREA
//* ---------------------------------------------------------------------------------------------
const validateTaskData = ((inputTaskValue, inputDateValue) => {
  let response = true;

  if (inputTaskValue === '') {
    arrayMessages.push('Tarea titulo requerido');
    form.input_task.focus();
    response = false;
  } else if (inputTaskValue.length > 40) {
    arrayMessages.push(`De [1-40] caracteres, actuales ${inputTaskValue.length}`);
    form.input_task.focus();
    response = false;
  } else if ((selectedColor === undefined) || (selectedColor === null) || (selectedColor === '')) {
    arrayMessages.push('Tarea color requerido');
    response = false;
  } else if (inputDateValue === '') {
    arrayMessages.push('Tarea fecha requerida');
    form.input_date.focus();
    response = false;
  } else if (compareDates(inputDateValue) === true) {
    arrayMessages.push('Fecha menor a la actual');
    form.input_date.focus();
    response = false;
  }

  if (arrayMessages.length > 0) {
    containerMessages.classList.add('container-messages-visible');
    messagesParagraph.textContent = '';
    messagesParagraph.innerHTML = arrayMessages.join(', ');
    response = false;
  }

  return (response);
});
//* ---------------------------------------------------------------------------------------------

//* 6.- FUNCIÓN QUE CREA LAS TAREAS
//* ---------------------------------------------------------------------------------------------
const createTask = ((idTask, inputTask, registrationDate, completionDateTime, color) => {
  const task = {
    id: idTask,
    title: inputTask,
    registrationDate,
    completionDate: completionDateTime,
    bgcolor: color,
    completed: false,
  };

  arrayTasks.unshift(task);

  return task;
});
//* ---------------------------------------------------------------------------------------------

//* 7.- GRUPO DE FUNCIONES ENCARGADAS DE MANEJAR Y MOSTRAR EL COUNTDOWN
//* ---------------------------------------------------------------------------------------------
//* 7.1.- "timeRemaning" (Tiempo restante): Calcula el tiempo restante para la culminación
//*        de la tarea.
//* ---------------------------------------------------------------------------------------------
const timeRemaning = ((completionDate) => {
  const dateTimeNow = new Date();
  const fullTimeRemaning = ((new Date(completionDate) - dateTimeNow + 1000) / 1000);
  const secondsRemaning = (`0${Math.floor(fullTimeRemaning % 60)}`).slice(-2);
  const minutesRemaning = (`0${Math.floor((fullTimeRemaning / 60) % 60)}`).slice(-2);
  const hoursRemaning = (`0${Math.floor((fullTimeRemaning / 3600) % 24)}`).slice(-2);
  const daysRemaning = (`0${Math.floor(fullTimeRemaning / (3600 * 24))}`).slice(-2);
  const yearsRemaning = Math.floor(fullTimeRemaning / (86400 * 365));

  return {
    fullTimeRemaning,
    secondsRemaning,
    minutesRemaning,
    hoursRemaning,
    daysRemaning,
    yearsRemaning,
  };
});
//* ---------------------------------------------------------------------------------------------

//* 7.2.- "showCountDown" (Muestra la cuenta atras): Muestra el tiempo restante de la tarea,
//*        en nuestra tarea, llamando a la función (timeRemaning - tiempo restante) de la tarea.
//* ---------------------------------------------------------------------------------------------
const showCountDown = () => {
  if ((arrayTasks.length <= 0)) {
    clearInterval(interval);
  } else {
    const tasksCompletionDate = document.querySelectorAll('[data-taskCompletionDate]');

    tasksCompletionDate.forEach((element) => {
      const completionDate = element.getAttribute('data-taskCompletionDate');
      const time = timeRemaning(completionDate);

      if (time.fullTimeRemaning <= 0) {
        // eslint-disable-next-line no-param-reassign
        element.textContent = 'Time Ended!!';
      } else {
        // eslint-disable-next-line no-param-reassign
        element.textContent = `${time.daysRemaning} ${time.hoursRemaning} ${time.minutesRemaning} ${time.secondsRemaning}`;
      }
    });
  }
};
//* ---------------------------------------------------------------------------------------------
//* ---------------------------------------------------------------------------------------------

//* 8.- FUNCIÓN QUE MUESTRA LAS TAREAS TRAIDAS DESDE EL LOCAL STORAGE EN NUESTRO HTML
//* --------------------------------------------------------------------------------------------
const showTasks = (() => {
  interval = setInterval((showCountDown), 1000);

  containerTasks.innerHTML = '';
  arrayTasks = JSON.parse(localStorage.getItem('tasks'));

  if (arrayTasks === null) {
    arrayTasks = [];
  } else {
    arrayTasks.forEach((task) => {
      let lineThrough;
      if (task.completed) { lineThrough = 'line-through'; } else { lineThrough = ''; }

      containerTasks.innerHTML += `
        <div class="container-tasks__item" style="background-color: ${task.bgcolor}">
          <div class="container-tasks__item__div-span">
            <span class="container-tasks__item__div-span__span ${lineThrough}" id="span-title" data-id=${task.id}>${task.title}</span>
          </div>

          <div class="container-tasks__item__div-register-date">
            <label class="container-tasks__item__div-register-date__register">Inicio: ${task.registrationDate}</label>
          </div>

          <div class="container-tasks__item__div-completion-date">
            <label class="container-tasks__item__div-completion-date__completion">Fin: ${task.completionDate}</label>
          </div>

          <div class="container-tasks__item__div-count-down-label">
            <label class="container-tasks__item__div-count-down-label__label">D H M S</label>
          </div>

          <div class="container-tasks__item__div-count-down-data">
            <label class="container-tasks__item__div-count-down-data__data" data-taskCompletionDate=${task.completionDate}></label>
          </div>

          <div class="container-tasks__item__div-modificar">
            <label class="container-tasks__item__div-modificar__label-modificar" data-id=${task.id}>Ѵ</label>
          </div>

          <div class="container-tasks__item__div-borrar">
            <label class="container-tasks__item__div-borrar__label-borrar" data-id=${task.id}>X</label>
          </div>
        </div>
      `;
    });
  }
});
//* --------------------------------------------------------------------------------------------

//* 9.- FUNCIÓN QUE GUARDA LAS TAREAS EN EL LOCAL STORAGE
//* --------------------------------------------------------------------------------------------
const saveLocalStorage = (() => {
  localStorage.setItem('tasks', JSON.stringify(arrayTasks));
  arrayMessages = [];
  messagesParagraph.textContent = '';
  selectedColor = '';

  divColors.firstElementChild.classList.remove('container-form__form__div-colors__html-div1-active');
  divColors.children[1].classList.remove('container-form__form__div-colors__html-div2-active');
  divColors.lastElementChild.classList.remove('container-form__form__div-colors__html-div3-active');

  containerMessages.classList.remove('container-messages-visible');

  showTasks();
});
//* --------------------------------------------------------------------------------------------

//* 10.- FUNCIÓN PARA ELIMINAR ITEMS O TAREAS TANTO DEL LOCAL STORAGE COMO DE LA WEB
//* --------------------------------------------------------------------------------------------
const deleteTask = ((taskToDeleteId) => {
  const indexTask = arrayTasks.findIndex((task) => task.id === taskToDeleteId);
  arrayTasks.splice(indexTask, 1);
  saveLocalStorage();
});
//* --------------------------------------------------------------------------------------------

//* 11.- FUNCIÓN PARA COMPLETAR TAREAS DEL LOCAL STORAGE COMO DE LA WEB
//* --------------------------------------------------------------------------------------------
const completedTask = ((taskToCompledId) => {
  const indexTask = arrayTasks.findIndex((task) => task.id === taskToCompledId);
  arrayTasks[indexTask].completed = !(arrayTasks[indexTask].completed);
  saveLocalStorage();
});
//* --------------------------------------------------------------------------------------------

//* 12.- FUNCIÓN PARA ACTUALIZAR TAREAS DEL LOCAL STORAGE COMO DE LA WEB
//* --------------------------------------------------------------------------------------------
const updateTask = ((taskToUpdateId) => {
  const { action } = form.input_submit.dataset;

  if (action === 'update') {
    divColors.firstElementChild.classList.remove('container-form__form__div-colors__html-div1-active');
    divColors.children[1].classList.remove('container-form__form__div-colors__html-div2-active');
    divColors.lastElementChild.classList.remove('container-form__form__div-colors__html-div3-active');

    const indexTask = arrayTasks.findIndex((task) => task.id === taskToUpdateId);
    const { title, completionDate, bgcolor } = arrayTasks[indexTask];

    form.input_task.value = title;
    form.input_date.value = completionDate;
    selectedColor = bgcolor;

    if (selectedColor === '#008000') {
      divColors.firstElementChild.classList.add('container-form__form__div-colors__html-div1-active');
    } else if (selectedColor === '#ff4500') {
      divColors.children[1].classList.add('container-form__form__div-colors__html-div2-active');
    } else if (selectedColor === '#ff0000') {
      divColors.lastElementChild.classList.add('container-form__form__div-colors__html-div3-active');
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      arrayMessages = [];
      const inputTaskValue = form.input_task.value;
      const inputDateValue = form.input_date.value;

      if (validateTaskData(inputTaskValue, inputDateValue)) {
        arrayTasks[indexTask].title = form.input_task.value;
        arrayTasks[indexTask].completionDate = form.input_date.value;
        arrayTasks[indexTask].registrationDate = restrictDate();
        arrayTasks[indexTask].bgcolor = selectedColor;

        saveLocalStorage();

        form.reset();
        form.input_submit.value = '+';
        form.input_submit.dataset.action = 'add';
        window.location.reload();
      }
    });
  }
});
//* --------------------------------------------------------------------------------------------
//* ============================================================================================== */

//* CÓDIGO PRINCIPAL Y EVENT LISTENER
//* ================================================================================================= */
//* 1.- Evento de escucha del DOM al terminar de cargar todos los elementos html, llama a la
//*     función showTasks(), encargada de mostrar las tareas traidas desde el LocalStorage.
//*     Tambien podemos usar esta linea "window.addEventListener('load', showTasks());
//*     document.addEventListener('DOMContentLoaded', showTasks);
document.addEventListener('DOMContentLoaded', () => {
  showTasks();
});

//* 2.- Coloca el foco en el input donde se agrega la tarea
form.input_task.focus();

//* 3.- Selecciona el color de fondo de la tarea (Delegación de Eventos).
divColors.addEventListener('click', (event) => {
  event.preventDefault();
  const taskColor = event.target.classList[1];

  switch (taskColor) {
    case 'div1':
      selectedColor = '#008000';
      divColors.firstElementChild.classList.toggle('container-form__form__div-colors__html-div1-active');
      divColors.children[1].classList.remove('container-form__form__div-colors__html-div2-active');
      divColors.lastElementChild.classList.remove('container-form__form__div-colors__html-div3-active');
      break;
    case 'div2':
      selectedColor = '#ff4500';
      divColors.children[1].classList.toggle('container-form__form__div-colors__html-div2-active');
      divColors.firstElementChild.classList.remove('container-form__form__div-colors__html-div1-active');
      divColors.lastElementChild.classList.remove('container-form__form__div-colors__html-div3-active');
      break;
    case 'div3':
      selectedColor = '#ff0000';
      divColors.lastElementChild.classList.toggle('container-form__form__div-colors__html-div3-active');
      divColors.firstElementChild.classList.remove('container-form__form__div-colors__html-div1-active');
      divColors.children[1].classList.remove('container-form__form__div-colors__html-div2-active');
      break;
    case undefined:
      arrayMessages.push('Color de tarea indefinido');
      break;
    case null:
      arrayMessages.push('Color de tarea null');
      break;
    default:
      arrayMessages.push('Color de tarea requerido');
      break;
  }
});

//* 4.- Evento de escucha del submit en el formulario "boton +", el cual agrega una tarea nueva.
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const { action } = form.input_submit.dataset;

  if (action === 'add') {
    arrayMessages = [];
    const idTask = generateId();
    const registrationDate = restrictDate();
    const inputTaskValue = form.input_task.value;
    const inputDateValue = form.input_date.value;

    if (validateTaskData(inputTaskValue, inputDateValue)) {
      const inputTask = form.input_task.value;
      form.input_task.value = '';
      const completionDateTime = form.input_date.value;

      createTask(idTask, inputTask, registrationDate, completionDateTime, selectedColor);
      saveLocalStorage();
    }
  }
});

//* 5.- Evento de escucha del Div contenedor de todas nuestras tareas, esto nos permitirá seleccionar
//*     en especial la etiqueta label con el simbolo de eliminar o el de completar.
containerTasks.addEventListener('click', (event) => {
  event.preventDefault();

  if (event.target.innerHTML === 'X') {
    // Tarea seleccionada para eliminar (usando id)
    const taskToDeleteId = event.target.getAttribute('data-id');
    deleteTask(taskToDeleteId);
  } else if (event.target.innerHTML === 'Ѵ') {
    // Tarea seleccionada para completar (usando id)
    const taskToCompledId = event.target.getAttribute('data-id');
    completedTask(taskToCompledId);
  }

  // Tarea seleccionada para actualizar (usando id)
  if (event.target.matches('#span-title')) {
    const taskToUpdateId = event.target.getAttribute('data-id');
    form.input_submit.value = 'U';
    form.input_submit.dataset.action = 'update';
    updateTask(taskToUpdateId);
  }
});
//* ==============================================================================================
