//Modules

//Data of our project goes here:
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    }

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    }

    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }


    var calculateTotal = function(type) {
        var sum = 0
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        })

        data.totals[type] = sum;

    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItems: function(type, des, val) {

            var ID, newItem;

            //ID of the last element + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }

            if (type === 'inc') {
                newItem = new Income(ID, des, val)
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            }

            data.allItems[type].push(newItem)

            return newItem

        },

        deleteItem: function(type, id) {
            var ids, index;

            //We create a new array which has the ids of the elements left in allItems[type]

            ids = data.allItems[type].map(function(current) {
                return current.id
            })

            index = ids.indexOf(id)

            if (index != -1) {
                data.allItems[type].splice(index, 1)
            }



        },

        calculateBudget: function() {

            // 1. Calculate exp and inc
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate budget
            data.budget = data.totals.inc - data.totals.exp

            // 3. Calaculate the percentage of total expense
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function() {

            return {
                budget: data.budget,
                income: data.totals.inc,
                expense: data.totals.exp,
                percentage: data.percentage
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(curr) {
                return curr.calcPercentage(data.totals.inc);
            })

        },

        getPercentages: function() {

            var allPercent = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            })

            return allPercent

        },



        testing: function() {
            console.log(data)
        }

    }

})();



//Handels the UI
var UIController = (function() {

    var DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }


    var formatNumber = function(num, type) {

        num = Math.abs(num)
        num = num.toFixed(2)
        num = num.split('.')

        int = num[0]

        if (int.length > 3) {

            int = int.substring(0, int.length - 3) + ','
            int.substring(int.length - 3, 3)

        }

        des = num[1]

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + des;

    }

    var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i)
                }
            }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            if (type == 'inc') {
                element = DOMstring.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>'
            } else if (type == 'exp') {
                element = DOMstring.expenseContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem: function(itemID) {

            var el = document.getElementById(itemID)
            el.parentNode.removeChild(el)

        },

        clearFields: function() {
            var fields;

            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);

            fieldsArr = Array.prototype.slice.call(fields); //Converting nodes into arrays

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            })

            fieldsArr[0].focus()

        },

        displayBudget: function(obj) {
            obj.income > obj.expense ? type = 'inc' : type = 'exp'


            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.income, 'inc')
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.expense, 'exp')

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%'
            } else {
                document.querySelector(DOMstring.percentageLabel).textContent = '---'
            }

        },

        displayPercentage: function(percentage) {

            var fields = document.querySelectorAll(DOMstring.expensesPercLabel)

            nodeListForEach(fields, function(current, index) {

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%'
                } else {
                    current.textContent = '---'
                }

            })

        },

        displayMonth: function() {

            var now, month, year;

            months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];


            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year

        },

        changedType: function(){

        	var fields = document.querySelectorAll(DOMstring.inputType + ', ' + DOMstring.inputDescription + ', ' + DOMstring.inputValue)

        	nodeListForEach(fields, function(curr){
        		curr.classList.toggle('red-focus')
        	})

        	document.querySelector(DOMstring.inputBtn).classList.toggle('red')

        },


        getDOMstring: function() {
            return DOMstring;
        }
    }


})();



//Controls the app and it's functions
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {

        DOM = UICtrl.getDOMstring()

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function(event) {

            if (event.charCode === 13 || event.which === 13) {

                ctrlAddItem()

            }

        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)

    }

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentages = function() {
        var percentages;

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages()

        // 2. Return the value of percentages 
        percentages = budgetCtrl.getPercentages()

        // 3. Update the UI 
        UICtrl.displayPercentage(percentages);
    }

    var ctrlAddItem = function() {
        var input, addItem;

        // 1. Get input field data from the UI
        input = UICtrl.getInput()

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            addItem = budgetCtrl.addItems(input.type, input.description, input.value)

            // 3. Add item to the UI
            UICtrl.addListItem(addItem, input.type);

            // 4. Clear input fields
            UICtrl.clearFields();

            // 5. Updating and displaying budget on UI
            updateBudget();

            //6. Update the Percentage
            updatePercentages();

        }

    }

    var ctrlDeleteItem = function(event) {

        var targetID, splitID, type, ID;

        targetID = event.target.parentNode.parentNode.parentNode.parentNode.id //will be income-1 or expense-1

        if (targetID) {

            splitID = targetID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])

            //1. Delete item from the data
            budgetCtrl.deleteItem(type, ID)

            //2. Delete item from the UI
            UICtrl.deleteListItem(targetID)

            //3. Update the UI
            updateBudget();

            //4. Update the Percentage
            updatePercentages();



        }


    }
    return {
        init: function() {
            console.log('The application has now started!')
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                income: 0,
                expense: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();