$(function () {
    $("#wizard").steps({
      headerTag: "h4",
      bodyTag: "section",
      transitionEffect: "fade",
      enableAllSteps: true,
      transitionEffectSpeed: 500,
      onStepChanging: function (event, currentIndex, newIndex) {
        if (newIndex >= 1) {
          $(".actions ul").addClass("actions-next");
        } else {
          $(".actions ul").removeClass("actions-next");
        }
        return true;
      },
      onFinishing: function (event, currentIndex) {
        return validateForm(); // Llama a la función de validación antes de finalizar
      },
      onFinished: function (event, currentIndex) {
        window.location.href = "http://vitalia-selfcare.vercel.app/"; // Redirige si el formulario es válido
      },
      labels: {
        finish: "Finalizar",
        next: "Siguiente",
        previous: "Atrás",
      },
    });
  
    // Custom Steps
    $(".wizard > .steps li a").click(function () {
      $(this).parent().addClass("checked");
      $(this).parent().prevAll().addClass("checked");
      $(this).parent().nextAll().removeClass("checked");
    });
  
    // Custom Button Jquery Step
    $(".forward").click(function () {
      $("#wizard").steps("next");
    });
    $(".backward").click(function () {
      $("#wizard").steps("previous");
    });
  
    // Input Focus
    $(".form-holder").delegate("input", "focus", function () {
      $(".form-holder").removeClass("active");
      $(this).parent().addClass("active");
    });
  
    // Función de validación
    function validateForm() {
      // Validación de email
      const email = $('input[type="email"]').val();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Por favor, ingrese un correo electrónico válido.");
        return false;
      }
  
      // Validación de nombre
      const nombre = $('input[placeholder="Nombre y Apellido"]').val();
      const nombrePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+ [a-zA-ZÀ-ÿ\u00f1\u00d1]+$/;
      if (!nombrePattern.test(nombre) || nombre.length > 30) {
        alert("Por favor, ingrese un nombre y apellido válidos (máximo 30 caracteres).");
        return false;
      }

      // Validación de edad
      const edad = parseInt($('input[type="number"]').val(), 10);
      if (edad < 13 || edad > 100 || isNaN(edad)) {
       alert("Por favor, ingrese una edad válida (entre 13 y 100 años).");
       return false;
      }

      // Validación de país seleccionado
      const pais = $('select.form-control').val();
      if (!pais) {
        alert("Por favor, seleccione un país.");
        return false;
      }

      // Validación de aceptar términos
      const acceptTermsChecked = $('#accept-terms input[type="checkbox"]').is(":checked");
      if (!acceptTermsChecked) {
        alert("Debe aceptar los términos y condiciones para continuar.");
        return false;
      }
  
      // Validación de preguntas con al menos una opción marcada
      const radioGroups = ['genero', 'discapacidad', 'actividad-fisica', 'habitos-alimenticios', 'calidad-sueño', 'estres-ansiedad', 'rutina-diaria', 'estilo-de-vida'];
      for (let group of radioGroups) {
        if (!$(`input[name="${group}"]:checked`).length) {
          alert("Por favor, asegurese de responder todas las preguntas.");
          return false;
        }
      }
  
      // Validación de contraseña y repetición de contraseña
      const password = $('input[placeholder="Crea una contraseña"]').val();
      const confirmPassword = $('input[placeholder="Repite tu contraseña"]').val();
      if (password === "" || confirmPassword === "" || password !== confirmPassword) {
        alert("Las contraseñas no coinciden o no se han completado.");
        return false;
      }
  
      // Si todas las validaciones son correctas
      return true;
    }
  });
  