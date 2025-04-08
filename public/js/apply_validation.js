// VALIDAR FORM
$(document).ready(function() {
	
	// MENSAGEM DE VALIDAÇÃO
	$.validator.messages.required = '* Campo obrigatório';
	$.validator.messages.email = '* Informe um formato de e-mail válido';
	$.validator.messages.equalTo = '* Os valores informados são diferentes';
	$.validator.messages.max = '* Valor máximo excedido';

    // VALIDATE FORM
    $('.validateForm').each(function(){
    	validateForm ($(this));
    });

});


	// VALIDATE FORM
function validateForm (jThis){
    jThis.validate({
        onfocusout: false,

    	invalidHandler: function(event, validator) {
            toastr.warning(validator.errorList[0].message);
        },
        errorPlacement: function(error, element) {
            error.prependTo( element.parent() );
        },
        submitHandler: function(form) {
        	var form = $(form),
        		loading = $('#loading_screen');

            if (form.hasClass('submit_form')) {
                form.submit();
            }else{

                loading.show();

                console.log('Realizar uma requisição AJAX com os dados do formulário ' +form.serialize()+ ' e setar a mensagem de feedback de acordo com o retorno da requisição');
                toastr.success("Mensagem de sucesso!");

                loading.hide();
            }
        }
    });
}
