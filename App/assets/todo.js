
// todo - главный объект, data - информация из local storage 
var todo = todo || {},
    data = JSON.parse(localStorage.getItem("todoData"));

data = data || {};


// самовызывающаяся функция
(function(todo, data, $) {
 
	console.log(data)

    var defaults = { // селекторы и атрибуты JavaScript, которые будут использованы в функциях
            todoTask: "todo-task",
            todoHeader: "task-header",
            todoDate: "task-date",
            todoDescription: "task-description",
            taskId: "task-",
            formId: "todo-form",
            dataAttribute: "data",
            deleteDiv: "delete-div",
            color: "color"
        }

    var codes = {
            "1" : "#pending",  // Для запланированных задач
            "2" : "#inProgress", // Для выполняемых задач
            "3" : "#completed" // Для завершенных задач
        };

    todo.init = function (options) {

        options = options || {};

        //Функция jQuery.extend() изменяет (расширяет) и возвращает исходный объект, 
        //дополняя его свойствами объектов источников. 
        //(Имитация наследования в объектно-ориентированных языках программирования.)
        options = $.extend({}, defaults, options);

        // Перебор элементов в data, calback f обрабатывает каждый элемент
        $.each(data, function (index, params) {
            generateElement(params); 
        });

        /*generateElement({
            id: "123",
            code: "1",
            title: "asd",
            date: "22/12/2013",
            description: "Blah Blah"
        });*/

        /*removeElement({
            id: "123",
            code: "1",
            title: "asd",
            date: "22/12/2013",
            description: "Blah Blah"
        });*/

        // Функция перетаскивания по категориям
        //index - 1,2,3 value это id
        $.each(codes, function (index, value) {
            $(value).droppable({
                drop: function (event, ui) {
                        var element = ui.helper,
                            css_id = element.attr("id"),
                            id = css_id.replace(options.taskId, ""),
                            object = data[id];

                            // Удаляем старый элемент
                            removeElement(object);

                            // Изменяем object code
                            object.code = index;

                            // Генерируем новый элемент
                            generateElement(object);

                            // Обновляем Local Storage
                            data[id] = object;
                            localStorage.setItem("todoData", JSON.stringify(data));

                            // скрываем корзину
                            $("#" + defaults.deleteDiv).hide();
                    }
            });
        });

        // Добавляем функцию по переносу в корзину
        $("#" + options.deleteDiv).droppable({
            drop: function(event, ui) {
                var element = ui.helper,
                    css_id = element.attr("id"),
                    id = css_id.replace(options.taskId, ""),
                    object = data[id];

                // удаляем старый элемент
                removeElement(object);

                // обновляем local storage
                delete data[id];
                localStorage.setItem("todoData", JSON.stringify(data));

                // скрываем корзину
                $("#" + defaults.deleteDiv).hide();
            }
        })

    };

    // Добавляем задачу
    var generateElement = function(params){
        var parent = $(codes[params.code]),
            wrapper; // что такое wrapper

        if (!parent) {
            return;
        }

        wrapper = $("<div />", {
            "class" : defaults.todoTask,
            "id" : defaults.taskId + params.id,
            "data" : params.id
        }).appendTo(parent);

         var i = $("<img />", {
            "src": "61776.png"
        })

        i[0].style.width = "15px"
        i[0].style.height = "15px"
        i[0].style.float = "right"
        


        i.appendTo(wrapper);

        $("<div />", {
            "class" : defaults.todoHeader,
            "text": params.title
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.todoDate,
            "text": params.date
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.todoDescription,
            "text": params.description
        }).appendTo(wrapper);




        wrapper[0].style.backgroundColor = params.color

        wrapper.draggable({
            start: function() {
                $("#" + defaults.deleteDiv).show();
            },
            stop: function() {
                $("#" + defaults.deleteDiv).hide();
            }
        });
    };

    // Удаляем задачу
    var removeElement = function (params) {
        $("#" + defaults.taskId + params.id).remove();
    };

    todo.add = function() {
        var inputs = $("#" + defaults.formId + " :input"),
            errorMessage = "Заголовок не может быть пустым",
            id, title, description, date, tempData, color;

        if (inputs.length !== 5) {
            return;
        }

        title = inputs[0].value;
        description = inputs[1].value;
        date = inputs[2].value;
        color = inputs[3].style.backgroundColor;


        if (!title) {
            generateDialog(errorMessage);
            return;
        }

        id = new Date().getTime();

        tempData = {
            id : id,
            code: "1",
            title: title,
            date: date,
            color: color,
            description: description
        }

        // сохраняем элемент в local storage
        data[id] = tempData;
        localStorage.setItem("todoData", JSON.stringify(data));

        // генерируем todo елемент
        generateElement(tempData);

        // обновляем форму
        inputs[0].value = "";
        inputs[1].value = "";
        inputs[2].value = "";
        inputs[3].value = "#000000";
    };
	
	//выводим сообщение об ошибке, если заголовок пустой
    var generateDialog = function (message) {
        var responseId = "response-dialog",
            title = "Ошибка",
            responseDialog = $("#" + responseId),
            buttonOptions;

        if (!responseDialog.length) {
            responseDialog = $("<div />", {
                    title: title,
                    id: responseId
            }).appendTo($("body"));
        }

        responseDialog.html(message);

        buttonOptions = {
            "ОК" : function () {
                responseDialog.dialog("close");
            }
        };

        responseDialog.dialog({
            autoOpen: true,
            width: 400,
            modal: true,
            closeOnEscape: true,
            buttons: buttonOptions
        });
    };

    todo.clear = function () {
        data = {};
        localStorage.setItem("todoData", JSON.stringify(data));
        $("." + defaults.todoTask).remove();
    };

})(todo, data, jQuery);