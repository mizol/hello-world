
// UI Controller
const UICtrl = (function(){
    
    const UISelectors = {
        itemList: '#item-list',
        addBtn: '.add-btn',
        itemNameInput: '#item-ev-name',
        itemDateInput: '#item-ev-date',
        eventGrid: '#myGrid',
        totalEvents: '.total-events'
      }

    let gridOptions = {
        columnDefs: [],
        rowData: [],
    };

    // Public methods
    return {
        getSelectors: function(){
            return UISelectors;
        },

        getItemInput: function(){
            return {
                name: document.querySelector(UISelectors.itemNameInput).value,
                date: document.querySelector(UISelectors.itemDateInput).value
            }
        },
        
        addListItem: function(item){
            //grid add new row
            //https://www.ag-grid.com/javascript-grid-api/
            //https://www.ag-grid.com/javascript-getting-started/
            //https://www.ag-grid.com/javascript-grid-data-update/

            var grid = document.querySelector(UISelectors.eventGrid);

            var uiDate = moment(item.date).format('DD-MM-YYYY');
            var row = [{name: item.name, date: uiDate}];

            gridOptions.api.updateRowData({add: row, addIndex: 0});
        },
        showTotalEvents: function (totalEvents){
            document.querySelector(UISelectors.totalEvents).textContent = totalEvents;
        },
        clearInput: function(){
            document.querySelector(UISelectors.itemNameInput).value = '';
            document.querySelector(UISelectors.itemDateInput).value = '';
        },
        showGrid: function(){
            debugger;
            const columnDefs = [
                { headerName: 'Event name', field: 'name'},
                { headerName: 'Event date', field: 'eventDate'}
            ];

            debugger;
            var data = RunCalCtrl.getEvents();
            let rowData = [{}];
            
            if(data) {
                rowData = data.forEach(function(item){
                return { name: item.name, eventDate: item.eventDate}
                });
            }
            // map to row
            // let rowData = [
            //     {name: 'Wet Hills', date: '2019-12-01'},
            //     {name: 'Gutsul Trail', date: '2019-06-05'}
            // ];
            
            //https://www.ag-grid.com/javascript-grid-properties/
            gridOptions = {
                columnDefs: columnDefs,
                rowData: rowData,
                //enableSorting: true,
                //enableFiltering: true,
            };

            const eGridDiv = document.querySelector('#myGrid');
            //https://medium.com/ag-grid/get-started-with-javascript-grid-in-5-minutes-bdcef746b5e0
            new agGrid.Grid(eGridDiv, gridOptions);
        },
        testFunc(){
            console.log(test);
        }

    }
})();

// Calendar Controller - Data controller
const RunCalCtrl = (function(){

    // Private methods
    const EventItem = function(id, name, eventDate, opt){
        this.id = id;
        this.name = name;
        this.eventDate = eventDate;
        this.options = opt;
    }

    const EventList = {
        items: [
            //{ id: 0, name: 'wethills', eventDate: '16/11/2019', opt: { map: '', site: '' } }
        ],
        currentEvent: null,
        count: 0
    }

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    // Public methods
    return {
        logData: function(){
            return EventList;
        },

        addItem: function(name, date){
            let ID;

            // Create ID
            if(EventList.items.length > 0){
              ID = EventList.items[EventList.items.length - 1].id + 1;
            } else {
              ID = 0;
            }
      
            // string date to DateTime
            var dtDate = new Date(date);

            if(!isValidDate(dtDate)){
                console.error('event date is invalid');
                return;
            }            
      
            //debugger;
            // Create new item
            var newItem = new EventItem(ID, name, dtDate);
      
            // Add to items array
            EventList.items.push(newItem);
      
            return newItem;
        },

        getTotalEvents: function(){
            let total = 0;
            
            // Loop through items and add cals
            EventList.items.forEach(function(item){
                total += 1;
            });
    
            // Set total cal in data structure
            EventList.count = total;
    
            // Return total
            return EventList.count;
        },

        getEvents: function(){
            return EventList.items;
        }
    }
})();

// App Controller
const RCalendarApp = (function(){
    

    // Load event listeners
    const loadEventListeners = function(){
        // Get UI selectors
        const UISelectors = UICtrl.getSelectors();

        // Add item event
        document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);
    }

    // Add item submit
    const itemAddSubmit = function(e){
      
        e.preventDefault();

        // Get form input from UI Controller
        const inputObj = UICtrl.getItemInput();
        
        // Check for name and date input
        if(inputObj.name !== '' && inputObj.date !== ''){
            // Add item
            const newItem = RunCalCtrl.addItem(inputObj.name, inputObj.date);

            //debugger;
            // Add item to UI list
            UICtrl.addListItem(newItem);

            //debugger;
            // Get total events
            const totalEvents = RunCalCtrl.getTotalEvents();

            // Add total calories to UI
            UICtrl.showTotalEvents(totalEvents);

            // Clear fields
            UICtrl.clearInput();
        }

        
  }

    // Public methods
    return {
        init: function(){

            moment.locale('en-GB');

            loadEventListeners();

            UICtrl.showGrid();            
        },

    }
})(UICtrl, RunCalCtrl);

RCalendarApp.init();
