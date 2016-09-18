
var SelectedItemList = React.createClass({
    handleClick: function(index, event){
        event.preventDefault();
        this.props.onRemoveSelectedItem(index);
    },
    render: function(){
        var _this = this;
        var idName = this.props.idName;
        var textName = this.props.textName;

        var idFormName = this.props.idFormName;
        var textFormName = this.props.textFormName;

        return (
            <ul className="mm-popover-tags">
            {
                this.props.items.map(function(item, index){
                    return (
                        <li>
                            <span>{item[textName]}</span> <a href="#" onClick={_this.handleClick.bind(_this, index)}><i className="fa fa-close"></i></a>
                            <input type="hidden" name={idFormName} value={item[idName]}  />
                            <input type="hidden" name={textFormName} value={item[textName]} />
                            {(_this.props.selectedItemCallback) ? _this.props.selectedItemCallback(item) : null}
                        </li>
                    )
                })
            }
            </ul>
        );
    }
});

var Typeahead = React.createClass({
    getInitialState: function() {
        return {
            selectOnly: (this.props.selectOnly) ? this.props.selectOnly : false,
            filterText: '',
            showDropdown: false,
            filteredItems: (this.props.data) ? this.props.data : [],
            selectedItems: (this.props.selectedItems) ? this.props.selectedItems : [],
            exactMatch: false,
            selectedItemIdx: -1,
            idName: (this.props.idName) ? this.props.idName : 'id',
            textName: (this.props.textName) ? this.props.textName : 'text'
        };
    },
    componentDidMount: function() {
        var addEvent = window.addEventListener,
            handleWindowClose = this.handleWindowClose;

        // The `focus` event does not bubble, so we must capture it instead.
        // This closes Typeahead's dropdown whenever something else gains focus.
        addEvent('focus', handleWindowClose, true);

        // If we click anywhere outside of Typeahead, close the dropdown.
        addEvent('click', handleWindowClose, false);
    },

    componentWillUnmount: function() {
        var removeEvent = window.removeEventListener,
            handleWindowClose = this.handleWindowClose;

        removeEvent('focus', handleWindowClose, true);
        removeEvent('click', handleWindowClose, false);
    },
    loadData: function(query){
        var url = '';

        if (typeof this.props.url == 'string') {
            url = this.props.url;
        } else if (typeof this.props.url == 'function') {
            url = this.props.url();
        }

        if (!url) {
            return null;
        }

        var seperator = "?";
        if (url.indexOf("?") > -1) {
            seperator = "&";
        }

        $.ajax({
            url: url + seperator + this.props.queryParam + '=' + query,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (typeof this.props.convertData != 'undefined') {
                    var resultList = this.props.convertData(data);
                    this.setDropdownList(query, resultList);
                } else {
                    this.setDropdownList(query, data);
                }

            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url, status, err.toString());
                this.setState({filteredItems: []});
            }.bind(this)
        });
    },
    renderInput: function(){
        return (
            <input type="text" placeholder={this.props.placeHolder}
                className={this.props.inputClass}
                value={this.state.filterText}
                ref="inputTextBox"
                onChange={this.handleTextChange}
                onFocus={this.handleFocus}
                onKeyDown={this.handleKeyDown}
                ></input>
        );
    },
    renderDropdown: function(){
        var _this = this;
        var selectedItemIdx = this.state.selectedItemIdx;
        var idName = this.state.idName;
        var textName = this.state.textName;

        var ulClassName = 'dropdown-item-list';
        if (this.state.showDropdown) {
            ulClassName = 'dropdown-item-list open';
        }

        return (
            <ul className={ulClassName} onMouseOut={this.handleMouseOut} >
            {
                this.state.filteredItems.map(function(item, index) {
                    var liClassName = (selectedItemIdx == index) ? 'active': '';

                    if (!_this.state.exactMatch && index == 0 && selectedItemIdx == 0) {
                        liClassName += ' non-match';
                    }

                    return (
                        <li key={item[idName]}
                            className={liClassName}
                            onClick={_this.handleItemClick.bind(_this, index)}
                            onMouseOver={_this.handleItemMouseOver.bind(_this, index)}
                        ><i className="fa fa-plus-circle"></i> <span>{item[textName]}</span></li>
                    );
                })
            }
            {
                (this.state.filteredItems.length == 0) ? <li> <span>Үр дүн олдсонгүй</span></li> : null
            }
            </ul>

        );
    },
    getExactMatchIdx: function(query, resultList) {
        if (query && resultList.length > 0) {
            for (var i = 0; i < resultList.length; i++) {
                if (resultList[i][this.state.textName] === query) {
                    return i;
                }
            }
        }

        return -1;
    },
    setDropdownList: function(query, resultList){
        var matchIdx = this.getExactMatchIdx(query, resultList);

        if (query && matchIdx == -1) {
            if (this.state.selectOnly) {
                this.setState({
                    exactMatch: false,
                    filteredItems: resultList,
                    selectedItemIdx: -1
                });
            } else {
                var newItem = {};
                newItem[this.state.idName] = 0;
                newItem[this.state.textName] = query;

                this.setState({
                    exactMatch: false,
                    filteredItems: [newItem].concat(resultList),
                    selectedItemIdx: 0
                });
            }

        } else {
            this.setState({
                exactMatch: true,
                filteredItems: resultList,
                selectedItemIdx: matchIdx
            });
        }
    },
    focus: function() {
        ReactDOM.findDOMNode(this.refs.inputTextBox).focus();
    },
    handleItemClick: function(index){
        var item = this.state.filteredItems[index];
        var selectedItems = this.state.selectedItems;

        if (!this.isInArray(selectedItems, item)) {
            this.addSelectedItem(item);
        }

    },
    addSelectedItem: function(item){
        if (this.props.itemSelectCallback) {
            this.props.itemSelectCallback(item);

            this.setState({
                filterText: '',
                showDropdown: false,
                selectedItemIdx: -1
            });
        } else {
            this.setState({
                filterText: '',
                showDropdown: false,
                selectedItems: this.state.selectedItems.concat([item]),
                selectedItemIdx: -1
            });
        }

    },
    handleMouseOut: function(event){
    },
    handleItemMouseOver: function(index) {
    },
    handleWindowClose: function(event) {
        var target = event.target;
        var inputTextBox = ReactDOM.findDOMNode(this.refs.inputTextBox);

        if (target !== window && !inputTextBox.contains(target)) {
            this.setState({
                showDropdown: false
            });
        }
    },
    handleTextChange: function() {
        var filterText = this.refs.inputTextBox.value;
        var textName = this.state.textName;

        if (this.props.url) {
            this.loadData(filterText);
            this.setState({
                filterText: filterText
            });
        } else {
            var resultList = [];
            this.props.data.forEach(function(item){
                if(filterText != '' && item[textName].indexOf(filterText) === -1) {
                    return;
                }

                resultList.push(item);
            }.bind(this));

            this.setState({
                filterText: filterText
            });
            this.setDropdownList(filterText, resultList);

            /*this.setState({
                filterText: filterText,
                filteredItems: filteredItems
            });*/
        }

    },
    handleFocus: function() {
        var filterText = this.refs.inputTextBox.value;

        if (this.props.url) {
            if (filterText == '') {
                this.loadData(filterText);
            }
        }

        this.setState({
            showDropdown: true
        });
    },
    handleKeyDown: function(event) {
        var showDropdown = true;
        var action = '';
        if (event.keyCode == 38) {
            action = 'up';
        }
        if (event.keyCode == 40) {
            action = 'down';
        }
        if (event.keyCode == 27) {
            showDropdown = false;
            action = 'esc';
        }

        if (event.keyCode == 13) {
            action = 'enter';
            event.preventDefault();
        }

        var length = this.state.filteredItems.length;
        var currentIdx = this.state.selectedItemIdx;
        var selectedItemIdx = -1;



        if (action == 'down') {
            if (length > 0) {
                if (currentIdx == -1) {
                    selectedItemIdx = 0;
                } else if (currentIdx == length - 1) {
                    selectedItemIdx = 0;
                } else {
                    selectedItemIdx = currentIdx + 1
                }
            }
        }

        if (action == 'up') {
            if (length > 0) {
                if (currentIdx == -1) {
                    selectedItemIdx = length - 1;
                } else if (currentIdx == 0) {
                    selectedItemIdx = length - 1;
                } else {
                    selectedItemIdx = currentIdx - 1
                }
            }
        }

        if (action == 'enter') {
            if (currentIdx > -1) {
                var item = this.state.filteredItems[currentIdx];
                var selectedItems = this.state.selectedItems;

                if (!this.isInArray(selectedItems, item)) {
                    this.addSelectedItem(item);
                } else {
                    this.setState({
                        showDropdown: false,
                        selectedItemIdx: -1
                    });
                }
            }

            return;
        }

        this.setState({
            showDropdown: showDropdown,
            selectedItemIdx: selectedItemIdx
        });

    },
    removeSelectedItem: function(index){
        var selectedItems = this.state.selectedItems.slice(0);
        selectedItems.splice(index,1);

        this.setState({
            selectedItems: selectedItems
        });
    },
    isInArray: function (items, item) {
        for (var i = 0; i < items.length; i++) {
            if (items[i][this.state.textName] === item[this.state.textName]) {
                return true;
            }
        }

        return false;
    },

    render: function(){
        return (
            <div className="mm-typeahead-wrapper">
                <div className="mm-typeahead" ref="typeahed">
                    {this.renderInput()}
                    {this.renderDropdown()}
                </div>
                <SelectedItemList items={this.state.selectedItems} onRemoveSelectedItem={this.removeSelectedItem}
                    idFormName={this.props.idFormName} textFormName={this.props.textFormName}
                    idName={this.state.idName} textName={this.state.textName}
                    selectedItemCallback={this.props.selectedItemCallback}/>
            </div>
        );
    }
});