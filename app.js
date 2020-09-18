//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100) > 100 ? 100 : Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var percentageCorrection = function (value) {
        return value > 100
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

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (currentElement, index, array) {
            sum += currentElement.value;
        });

        data.totals[type] = sum;
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on type
            switch (type) {
                case 'exp':
                    newItem = new Expense(ID, des, val);
                    break;
                case 'inc':
                    newItem = new Income(ID, des, val);
                    break;
            }

            //Push it to our data structure
            data.allItems[type].push(newItem);

            //Return new item
            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;

            //data.allItems[type][id]

            var ids = data.allItems[type].map(function (currentElement) {
                return currentElement.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {

            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                //Calculate the percentage of income that we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (currentElement) {
                currentElement.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (currentElement) {
                return currentElement.getPercentage();
            })

            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }
    }

})();

//UI CONTROLLER
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substring(0, int.length - 3) + ',' + int.substring(int.length - 3, int.length);
        }

        return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            //Create HTML string with placeholder text

            switch (type) {
                case 'inc':
                    element = DOMStrings.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                    break;
                case 'exp':
                    element = DOMStrings.expenseContainer;

                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                    break;
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value), type);


            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        getDOMStrings: function () {
            return DOMStrings;
        },
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (currentElement, indexNum, array) {
                currentElement.value = "";
                currentElement.description = "";
            });

            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp;'

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                if (obj.percentage > 100) {
                    obj.percentage = 100;
                }
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function (currentElement, index) {

                if (percentages[index] > 0) {
                    currentElement.textContent = percentages[index] + '%';
                } else {
                    currentElement.textContent = '---';
                }
            })
        },

        displayMonth: function () {
            var now, year, month, months;

            now = new Date();
            //var christmas = new Date(2019, 12, 25)

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month - 1] + ' ' + year;
        },
        changedType: function () {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function (currentElement) {
                currentElement.classList.toggle('red-focus');
            });

            document.querySelector('.ion-ios-checkmark-outline').classList.toggle('red');
        }
    };
})();


//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {

        //4. Calculate the budget
        budgetCtrl.calculateBudget();

        //Return the Budget
        var budget = budgetCtrl.getBudget();

        //5. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {

        //Calculate percentages
        budgetCtrl.calculatePercentages();

        //Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //Update the UI
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function () {

        //1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //Clear the fields
            UICtrl.clearFields();

            //Calculate and update budget
            updateBudget();

            //Update percentages
            updatePercentages();

            console.log('HI');

        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //Delete item from the UI
            UICtrl.deleteListItem(itemID);

            //Update and show the new budget
            updateBudget();

            //Update percentages
            updatePercentages();
        }

        console.log(event.target);
    };

    return {
        init: function () {
            var initBudget = {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            };
            UICtrl.displayMonth();
            console.log('INITIATED');
            setupEventListeners();
            UICtrl.displayBudget(initBudget);
        }
    }

})(budgetController, UIController);

controller.init();