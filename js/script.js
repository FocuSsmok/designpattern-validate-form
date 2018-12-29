// Singleton
function MyApp() {
    var instance = this;
    // FACADE
    instance.myEvent = {
        stop: function (e) {
            if (typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
            if (typeof e.stopPropagation() === 'function') {
                e.stopPropagation();
            }
            if (typeof e.returnValue === 'boolean') {
                e.returnValue = false;
            }
            if (typeof e.cancelBubble === 'boolean') {
                e.cancelBubble = true;
            }
        },
        handler: function (el, action, callback) {
            if (document.addEventListener) {
                el.addEventListener(action, callback);
            } else if (document.attachEvent) {
                el.attachEvent('action', callback);
            } else {
                var inlineAction = "on" + action;
                el[inlineAction] = callback;
            }
        }
    }
    // Strategy
    instance.validator = {
        types: {
            isNonEmpty: {
                validate: function (value) {
                    return value !== '';
                },
                instructions: " Pole nie może być puste!"
            },
            isNumber: {
                validate: function (value) {
                    return !isNaN(value);
                },
                instructions: " Wartość musi być liczbą!"
            },
            isAlphaNum: {
                validate: function (value) {
                    return !/[^a-z0-9]/i.test(value);
                },
                instructions: " Pole musi zawierać jednie litery i cyfre bez znaków specjalnych"
            },
            isEmail: {
                validate: function (value) {
                    return /[^@]+@[^@]+/.test(value);
                },
                instructions: " Wartość musi być poprawnym adresem mailowym"
            }
        },
        messages: [],
        config: {},

        setConfig: function (config) {
            this.config = config;
        },

        validate: function (data) {
            var i, msg, type, checker, resultOk;
            this.messages = [];

            for (i in data) {
                if (data.hasOwnProperty(i)) {
                    type = this.config[i];
                    checker = this.types[type];

                    if (!type) {
                        continue;
                    }

                    if (!checker) {
                        throw {
                            name: "ErrorValidation",
                            message: "walidator nie posiada obsługi " + type
                        };
                    }
                    resultOk = checker.validate(data[i]);
                    if (!resultOk) {
                        msg = "Niepoprawna wartość " + i + "." + checker.instructions;
                        this.messages.push(msg);
                    }
                }
            }
            return this.hasErrors();
        },

        hasErrors: function () {
            return this.messages.length !== 0;
        }
    }

    MyApp = function () {
        return instance;
    };
}

var myApp = new MyApp();

var form = document.querySelector(".register");

var config = {
    username: 'isAlphaNum',
    email: 'isEmail',
    first_name: 'isNonEmpty',
    age: 'isNumber'
};

myApp.validator.setConfig(config);

myApp.myEvent.handler(form, "submit", function (e) {
    myApp.myEvent.stop(e);
    var data = {
        username: form.username.value,
        email: form.email.value,
        first_name: form.first_name.value,
        age: form.age.value
    };

    var hasErrors = myApp.validator.validate(data);
    if (!hasErrors) {
        this.submit();
    } else {
        var erorrs = document.querySelector('.errors');
        for (let i = 0; i < myApp.validator.messages.length; i++) {
            var p = document.createElement("p");
            var text = document.createTextNode(myApp.validator.messages[i]);
            p.appendChild(text);
            erorrs.appendChild(p);
        }
    }
});