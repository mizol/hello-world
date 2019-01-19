// GIHub https://github.com/mizol/hello-world/tree/Add-extra-files
// https://www.netlify.com/


const LocalStorageCtrl = (function () {

    // Private methods
    const CurrentStorageKey = 'items'; // Keys Array

    function getLocalStorageItems(callback) {
        let items;

        if (localStorage.getItem(CurrentStorageKey) === null) {
            items = [];
            
            // Init local storage
            localStorage.setItem(CurrentStorageKey, JSON.stringify(items));
        } else {
            try {
                items = JSON.parse(localStorage.getItem(CurrentStorageKey));
            }
            catch (error) {
                console.error(error);
            }
        }

        return isFunction(callback) ? callback(items) : items;
    };

    function isFunction(functionToCheck) {
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }

    // Local Storage Controller
    function CreateNewId(EventList, item) {
        let id;
        // Create ID
        let items = getLocalStorageItems();

        if (items.length > 0) {
            id = items[items.length - 1].id + 1;
        } else {
            id = 1;
        }

        return id;
    }


    let setLocalStorageItem = function (items) {
        localStorage.setItem(CurrentStorageKey, JSON.stringify(items));
    }

    // Public methods
    return {
        getAllItems: function () {
            return getLocalStorageItems();
        },

        updateItem: function (updatedItem) {
            let items = getLocalStorageItems(function (items) {
                // Iterate and find by Id then Update it by splice(index, amount, new item) 
                items.forEach(function (item, index) {
                    if (updatedItem.id === item.id) {
                        items.splice(index, 1, updatedItem);
                    }
                });

                return items;
            });

            setLocalStorageItem(items);
        },

        deleteItem: function (id) {
            let items = getLocalStorageItems(function (items) {
                // Iterate by all items and find by Id 
                // and Update it by splice(index, amount, new item) 
                items.forEach(function (item, index) {
                    if (id === item.id) {
                        items.splice(index, 1);
                    }
                });

                return items;
            });

            setLocalStorageItem(items);
        },

        saveItem: function (item) {

            item.id = CreateNewId(item);
                        
            // Get what is already in local storage
            let items = JSON.parse(localStorage.getItem(CurrentStorageKey));

            // Push new item
            items.push(item);

            // Reset local storage
            setLocalStorageItem(items);

            return item;
        },

        clearAllItems: function () {
            localStorage.removeItem(CurrentStorageKey);
        }
    }
})();

// UI Controller
const UICtrl = (function () {

    const UiSelectors = {
        addBtn: '.add-btn',
        clearAllBtn: '.delete-all-btn',
        itemNameInput: '#item-ev-name',
        itemDateInput: '#item-ev-date',
        eventGrid: '#gvRunEvents',
        totalEvents: '.total-events'
    }

    const UiOptions = {
        columnDateTimeFormat: 'DD-MMM-YYYY', // moment.js
    }

    const columnDefs = [
        { headerName: '#', field: 'id' },
        { headerName: 'Event name', field: 'name' },
        { headerName: 'Event date', field: 'eventDate', type: ['dateColumn'] , cellRendererSelector: colDateRender}
    ];

    //https://www.ag-grid.com/javascript-grid-properties/
    const gridOptions = {
        columnDefs: columnDefs,
        rowData: [],
        rowSelection: 'single',
        suppressCellSelection: true,
        defaultColDef: { resizable: true },
        localeText: agGridLocalization(),
        components: {
            dateTimeCellRenderer: DateTimeCellRenderer,
        }
        //enableSorting: true,
        //enableFiltering: true,
    };

    //https://www.ag-grid.com/javascript-grid-internationalisation/
    function agGridLocalization() {
        return { noRowsToShow: 'No Run Events Found' }
    }

    function colDateRender(param) {
        if(param.colDef.type.includes('dateColumn')){
            param.cellFormat = UiOptions.columnDateTimeFormat;
            return {
                component: 'dateTimeCellRenderer'
            };
        }

        return null;
    }

    function DateTimeCellRenderer() {
    }
    
    DateTimeCellRenderer.prototype.init = function (params) {
        this.eGui = document.createElement('span');
        if (params.value !== "" || params.value !== undefined || params.value !== null) {
            this.eGui.innerHTML = moment(params.value).format(params.cellFormat);
        }
    };
    
    DateTimeCellRenderer.prototype.getGui = function () {
        return this.eGui;
    };
    
    // Public methods
    return {
        getSelectors: function () {
            return UiSelectors;
        },

        getGridOptions: function(){
            return gridOptions;
        },

        getItemInput: function () {
            return {
                name: document.querySelector(UiSelectors.itemNameInput).value,
                date: document.querySelector(UiSelectors.itemDateInput).value
            }
        },

        addListItem: function (item) {
            //grid add new row
            //https://www.ag-grid.com/javascript-grid-api/
            //https://www.ag-grid.com/javascript-getting-started/
            //https://www.ag-grid.com/javascript-grid-data-update/


            var uiDate = moment(item.date).format(UiOptions.columnDateTimeFormat);
            var row = [{ id: item.id, name: item.name, eventDate: uiDate }];

            gridOptions.api.updateRowData({ add: row, addIndex: 0 });
        },

        showTotalEvents: function (totalEvents) {
            document.querySelector(UiSelectors.totalEvents).textContent = totalEvents;
        },

        clearInput: function () {
            document.querySelector(UiSelectors.itemNameInput).value = '';
            document.querySelector(UiSelectors.itemDateInput).value = '';
        },

        showGrid: function () {
            let runEvents = RunCalCtrl.getEvents();
                        
            if(gridOptions.api) {
                gridOptions.api.setRowData(runEvents);
            } else {
                gridOptions.rowData = runEvents;
            }

            //https://medium.com/ag-grid/get-started-with-javascript-grid-in-5-minutes-bdcef746b5e0
            //gridOptions.api.setRowData(runEvents);
            //gridOptions.api.updateRowData({ add: row, addIndex: 0 });
            //gridOptions.api.sizeColumnsToFit();
            //var rowCount = gridOptions.api.getDisplayedRowCount();
        },
    }
})();

// Calendar Controller - Data controller
const RunCalCtrl = (function (LocalStorageCtrl) {

    // Private methods
    const EventItem = function (name, eventDate, opt) {
        //this.id = id;
        this.name = name;
        this.eventDate = eventDate;
        this.options = opt;
    }

    const EventList = {
        // items: [
        //     //{ id: 0, name: 'wethills', eventDate: '16/11/2019', opt: { map: '', site: '' } }
        // ],
        items: LocalStorageCtrl.getAllItems(),
        currentEvent: null,
        count: 0
    }

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    // Public methods
    return {
        logData: function () {
            return EventList;
        },

        addItem: function (name, date) {

            // Validate input parameters
            // string date to DateTime
            var dtDate = new Date(date);

            if (!isValidDate(dtDate)) {
                console.error('Event date is invalid');
                return;
            }

            // Create new item
            var newItem = new EventItem(name, dtDate);

            // Save to local storage
            return LocalStorageCtrl.saveItem(newItem);
        },

        getTotalEvents: function () {
            let total = 0;
            // Loop through items and add cals
            EventList.items.forEach(function (item) {
                total += 1;
            });

            // Set total cal in data structure
            EventList.count = total;

            // Return total
            return EventList.count;
        },

        getEvents: function () {
            return LocalStorageCtrl.getAllItems();
        }
    }
})(LocalStorageCtrl);

// App Controller
const RCalendarApp = (function () {

    // Load event listeners
    const loadEventListeners = function () {

        // Get UI selectors
        const UISelectors = UICtrl.getSelectors();

        // Event AddItem
        document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);

        // Event Delete all data
        document.querySelector(UISelectors.clearAllBtn).addEventListener('click', clearAllSubmit);

        // agGrid load
        document.addEventListener('DOMContentLoaded', function () {
            var gridDiv = document.querySelector(UISelectors.eventGrid);
            let gvOpt = UICtrl.getGridOptions();
            new agGrid.Grid(gridDiv, gvOpt);
            gvOpt.api.sizeColumnsToFit();
        });
    }

    // Add item submit
    const itemAddSubmit = function (e) {

        e.preventDefault();

        // Get form input from UI Controller
        const inputObj = UICtrl.getItemInput();

        // Check for name and date input
        if (inputObj.name !== '' && inputObj.date !== '') {
            // Add item
            const newItem = RunCalCtrl.addItem(inputObj.name, inputObj.date);

            //debugger;
            // Add item to UI list
            UICtrl.addListItem(newItem);

            //debugger;
            // Get total events
            //const totalEvents = RunCalCtrl.getTotalEvents();

            // Add total calories to UI
            //UICtrl.showTotalEvents(totalEvents);

            // Clear fields
            UICtrl.clearInput();
        }
    }

    // Clear All events
    const clearAllSubmit = function(e) {
        e.preventDefault();

        LocalStorageCtrl.clearAllItems();
        UICtrl.clearInput();
        UICtrl.showGrid();
    }

    // Public methods
    return {
        init: function () {

            moment.locale('en-GB');

            loadEventListeners();

            UICtrl.clearInput();
            UICtrl.showGrid();
        },

    }
})(UICtrl, RunCalCtrl);

RCalendarApp.init();
