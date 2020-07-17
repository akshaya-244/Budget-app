//TO-DO-LIST
/*                                                                             |UI   |DATA MODULE | CONTROLLER        
1.ADD EVENT HANDLER FOR THE PLUS AND MINUS SIGN                                |2    |3           | 1
2.GET INPUT VAUES FOR THE BAR NEXT TO THE PLUS AND MINUS SIGN                  |4    |5           |
3.ADD THE NEW ITEM TO OUR DATA STRUCTURE THAT IS THE INCOME AND THE EXPENSES   |6    |            |
4.ADD THE NEW ITEM TO THE UI THAT IS THE ITEMS UNDER INCOME AND EXPENSES       
5.CALCULATE THE BUDGET                                                          
6.UPDATE THE UI THAT IS THE BUDGET                                             
*/
//we begin with controller (with iife)(iife is used for privacy)
//BUDGET CONTROLLER
var budgetController=(function()  //Module 1
{
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expenses.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome>0)
        {
            this.percentage = Math.round((this.value/totalIncome)*100);  
        }
        else this.percentage=-1;
    };

    Expenses.prototype.getPercentage = function () {
        return this.percentage;
    };

    var calculateTotal = function(type){ //private function
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type]=sum;
    };

    var data =
    {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget:0,
        percentage :-1 //-1 means not existent  
    };
    return {
        addItem: function(type, des, val)
        {
            var newItem, ID;
            //create new ID
            if(data.allItems[type].length>0)
                ID = data.allItems[type][data.allItems[type].length-1].id +1;
            else
                ID=0;
            //create new item based on inc and exp
            if(type === 'exp') 
            {
                newItem = new Expenses(ID, des, val);
            }
            else if(type === 'inc')
            {
                newItem = new Income(ID, des, val);
            }
            //push into our data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },

        deleteItem : function(type, id){
            var index,ids;
            //id=6
            //data.allItems[type][id];
            //[1 3 4 6 8]
            //index=3
            ids= data.allItems[type].map(function(current){
                return current.id;
            });//map similar to forEach
            index=ids.indexOf(id);

            if(index !== -1)
            {
                data.allItems[type].splice(index, 1);//the item u want to delete ,how many u want to delete
            }
        },

        calculateBudget : function(){
            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate the income-expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0)
            {
            data.percentage=Math.round((data.totals.exp*100)/data.totals.inc); //percentage can be a decimal so we round it
            }
            else{
                data.percentage = -1; //non existent
            }
        },

        calculatePercentages : function() {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            })
            
        },
        getPercentages: function () {
                var allPerc= data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
                });
                return allPerc;    
        },

        getBudget :function(){   //created only to return the elements of the calcBud.to return more than one value we create an object
            return{
                budget : data.budget,
                percentage: data.percentage,
                income: data.totals.inc,
                expenses: data.totals.exp
            };
        },
        resetBudget : function(){
            return {
                budget : 0,
                percentage: -1,
                income: 0,
                expenses: 0
            };
        },
    
        testing: function(){
            console.log(data);
        }
    };

     
})();


//UI CONTROLLER
var UIController=(function(){
    var DOMStrings={
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn', // this is IIFE and addbtn is in the app controller so not accesible s we make an this obj public
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel: '.budget__income--value',
        percentageLabel1 : '.budget__income--percentage',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };  
        var formatNumber = function(num,type){
            //1. + or _ sign  
            //2. rounded up to 2 decimal places
            //3. comma seperator
    
            var numSplit, int, dec, num, type;
    
            num= Math.abs(num);
            num= num.toFixed(2);
            numSplit= num.split('.');
    
            int = numSplit[0];
            dec = numSplit[1];
    
            if(int.length > 3)
            {
                int= int.substr(0, int.length-3) + ',' +int.substr(int.length-3,int.length);
                
            }
            
            return (type === 'exp' ? '-' : '+')+ ' ' +int+ '.'+ dec;
            
        };
        var nodeListForEach = function(list, callBack)
        {
            for(var i=0;i<list.length;i++)
            {
                callBack(list[i],i);
            }
        };

    
   return{
       getInput: function(){
        return {
            type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value)

        };
    },

    addListItem: function(obj, type){
        var html, newHtml;
        //create html text with placeholder string
        if(type === 'inc'){
            element=DOMStrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div>  </div> </div>';
        }
        else if(type === 'exp'){
            element=DOMStrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix">  <div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
        }
        //replace placeholder with actual data
        newHtml =html.replace('%id%', obj.id); //since html is a string all the methods of string can be used here eg replace
        newHtml = newHtml.replace('%description%', obj.description);// here if u write html.replace %id% will still be there so we say newHtml .replace
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
        
        //insert html into dom
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID){
        var el=document.getElementById(selectorID);
        el.parentNode.removeChild(el);
    },

    clearfields: function(){
        var fields, fieldsArr;
        fields= document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
        fieldsArr= Array.prototype.slice.call(fields);
        fieldsArr.forEach(function(current, index, array){ //here we have access to 3 parameters like with the previous event listener
            current.value="";

        });
        fieldsArr[0].focus();
            
        
    },
    
    dispalyBudget : function(obj){
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';
        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.income, 'inc');
        document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.expenses,'exp');
        if(obj.percentage > 0)
        {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
        }
        else{
            document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        }


    },

    displayPercentages : function(percentages){
        var fields=document.querySelectorAll(DOMStrings.expPercentageLabel);
        
        nodeListForEach(fields , function(current, index){
            if(percentages[index] > 0)
            {
                current.textContent = percentages[index] + '%';

            }
            else current.textContent = '---'; 
        });
    },
    displayMonth: function(){
        var now, year, months,month;
        now= new Date();
       //if its christmas now = new Date(2016, 12,25);
       months= ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
       month= now.getMonth();
       year =now.getFullYear();
       document.querySelector(DOMStrings.dateLabel).textContent=months[month]+ " "+ year;
    },
    
    changedType : function(){

        var fields = document.querySelectorAll(
            DOMStrings.inputType + ',' +
            DOMStrings.inputDescription  + ',' +
            DOMStrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            }); 

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    getDOMStrings : function(){
        return DOMStrings;
    }
        
    };

})();

//GLOBAL APP CONTROLLER
var controller= (function(budgetCtrl,UICtrl){

    var setupEventListeners= function (){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click' , ctrlAddItem);
        document.addEventListener('keypress' , function(e){
            if(e.keyCode === 13 || e.which === 13)
            {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem );
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    var updateBudget = function(){
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        //2. return the budget
        var budget=budgetCtrl.getBudget();
        //3. display the budget on the ui
        UICtrl.dispalyBudget(budget);
    };

    var updatePercentages= function() {
        //1. Calculate the percentage
        budgetCtrl.calculatePercentages();
        //2. Read the percentages from the budget controller
        var percentages=budgetCtrl.getPercentages();
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem
        //1.Get the input data filled
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value>0)
        {
            //2. Add the item to the BC
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //4. clear the input fields
            UICtrl.clearfields();
            //5. Calculate the budget and update the budget
            updateBudget();
            //6. Calculate and update the percentages
            updatePercentages();
        }
        
        
    };

    var ctrlDeleteItem = function(e){
            var itemID,splitID,type,ID;
            itemID=e.target.parentNode.parentNode.parentNode.parentNode.id;
            if(itemID)
            {
                splitID=itemID.split('-');
                type=splitID[0];
                ID= parseInt(splitID[1]);
                //1. Delete the item from the data structure
                budgetCtrl.deleteItem(type,ID);
                //2. Delete the item from the UI
                UICtrl.deleteListItem(itemID);
                //3. Update nd show the new budget
                updateBudget();
                //4. Update and calculate the percentages
                updatePercentages();
            }
    };
    return {
        init : function(){
            
            setupEventListeners();
            var reset = budgetCtrl.resetBudget();
            UICtrl.displayMonth();
            UICtrl.dispalyBudget(reset);
        }
    };
})(budgetController, UIController);

controller.init();