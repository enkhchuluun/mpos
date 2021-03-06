'use strict';

var SearchInput = React.createClass({
    displayName: 'SearchInput',

    getInitialState: function getInitialState() {
        return {
            filterText: ''
        };
    },
    componentDidMount: function componentDidMount() {
        console.log('key handler set up');
        window.addEventListener('keydown', this.handleSearchFocus);
    },
    componentWillUnmount: function componentWillUnmount() {
        window.removeEventListener('keydown', this.handleSearchFocus);
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        console.log('search input prop will receive: %O', nextProps);
        if (nextProps.reset) {
            console.log('reset -> -> true');
            this.setState({
                filterText: ''
            });
        }
    },
    handleSearchFocus: function handleSearchFocus(event) {
        if (event.keyCode == 113) {
            //F2
            event.preventDefault();

            console.log('F2');

            this.refs.searchInputTextBox.focus();

            return;
        }
    },
    handleTextChange: function handleTextChange() {
        var filterText = this.refs.searchInputTextBox.value;

        this.setState({
            filterText: filterText
        });
    },
    handleFocus: function handleFocus() {},
    handleKeyDown: function handleKeyDown(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            event.stopPropagation();

            console.log('enter on search box');

            this.search();
        }

        if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) {
            this.refs.searchInputTextBox.blur();
        }
    },
    search: function search() {
        console.log('search');
        //callback
        var filterText = this.refs.searchInputTextBox.value;
        this.props.searchCallBack(filterText);
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('input', { type: 'text', className: 'form-control', placeholder: 'Барааны код, нэр', tabindex: '2',
                value: this.state.filterText,
                ref: 'searchInputTextBox',
                onChange: this.handleTextChange,
                onFocus: this.handleFocus,
                onKeyDown: this.handleKeyDown
            }),
            React.createElement(
                'span',
                { className: 'input-group-btn', onClick: this.search },
                React.createElement(
                    'button',
                    { type: 'submit', className: 'btn btn-default' },
                    React.createElement('i', { className: 'fa fa-search' })
                )
            )
        );
    }
});

var ProductItem = React.createClass({
    displayName: 'ProductItem',

    componentDidUpdate: function componentDidUpdate() {
        if (this.props.isSelected) {
            //this.myDiv.focus();
        }
    },
    handleClick: function handleClick() {
        this.props.itemClickCallback(this.props.variant);
    },
    render: function render() {
        var name = this.props.variant.productName;

        if (this.props.variant.sku) {
            name += ' (' + this.props.variant.sku + ')';
        }

        var price = numeral(this.props.variant.price).format('0,0');

        var className = "mm-pos-product";
        if (this.props.isSelected) {
            className = "mm-pos-product active";
        }

        return React.createElement(
            'div',
            { className: className, onClick: this.handleClick, ref: function (div) {
                    this.myDiv = div;
                }.bind(this) },
            React.createElement(
                'div',
                { className: 'image-wrapper' },
                React.createElement(
                    'div',
                    { className: 'image-content' },
                    React.createElement('span', null),
                    React.createElement('img', { src: 'http://' + this.props.variant.imgUrl })
                )
            ),
            React.createElement(
                'div',
                { className: 'product-name' },
                name
            ),
            React.createElement(
                'div',
                { className: 'product-price' },
                price,
                '₮'
            )
        );
    }
});

var ProductSearchArea = React.createClass({
    displayName: 'ProductSearchArea',

    getInitialState: function getInitialState() {
        return {
            selectedIndex: -1,
            products: [],
            variantList: []
        };
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        console.log('search area prop will receive: %O', nextProps);
        if (nextProps.reset) {
            console.log('reset -> true');
            this.setState({
                selectedIndex: -1,
                products: [],
                variantList: []
            });

            this.props.resetCallback();
        }
    },
    handleClick: function handleClick() {
        console.log('click on search area');
    },
    handleKeyDown: function handleKeyDown(event) {
        console.log('key down on search area:' + event.keyCode);
        if (event.keyCode == 40) {
            //down key
            event.preventDefault();

            this.rootDiv.focus();

            if (this.state.variantList.length > 0) {
                //find relative dim of target index div
                if (this.state.selectedIndex >= 0) {
                    var div = $(ReactDOM.findDOMNode(this.refs['product-item-' + this.state.selectedIndex]));
                    //parent with
                    console.log('parent width:%O, div width:%O', div.parent().innerWidth(), div.outerWidth(true));
                    //item with
                    var rowSize = Math.floor((div.parent().innerWidth() - 20) / div.outerWidth(true));
                    /*var rowCount = Math.ceil(this.state.variantList.length / rowSize);
                    var currentRow = Math.ceil(this.state.selectedIndex + 1 / rowSize);*/

                    console.log('row size:' + rowSize);

                    if (this.state.selectedIndex + rowSize < this.state.variantList.length) {
                        var targetIndex = this.state.selectedIndex + rowSize;
                        this.setState({ selectedIndex: targetIndex });
                    }
                } else {
                    this.setState({ selectedIndex: 0 });
                }
            }
        }

        if (event.keyCode == 38) {
            //up key
            event.preventDefault();

            this.rootDiv.focus();

            if (this.state.variantList.length > 0) {
                if (this.state.selectedIndex >= 0) {
                    var div = $(ReactDOM.findDOMNode(this.refs['product-item-' + this.state.selectedIndex]));
                    //parent with
                    //console.log('parent width:%O, div width:%O', div.parent().width(), div.outerWidth(true));
                    //item with
                    var rowSize = Math.floor((div.parent().innerWidth() - 20) / div.outerWidth(true));

                    if (this.state.selectedIndex - rowSize >= 0) {
                        var targetIndex = this.state.selectedIndex - rowSize;
                        this.setState({ selectedIndex: targetIndex });
                    }
                }
            }
        }

        if (event.keyCode == 39) {
            //right key
            event.preventDefault();

            this.rootDiv.focus();

            if (this.state.variantList.length > 0) {
                var targetIndex = this.state.selectedIndex + 1;

                if (targetIndex >= this.state.variantList.length) {
                    targetIndex = 0;
                }

                this.setState({ selectedIndex: targetIndex });
            }
        }

        if (event.keyCode == 37) {
            //left key
            event.preventDefault();

            this.rootDiv.focus();

            if (this.state.variantList.length > 0) {
                var targetIndex = this.state.selectedIndex - 1;

                if (targetIndex < 0) {
                    targetIndex = this.state.variantList.length - 1;
                }
                this.setState({ selectedIndex: targetIndex });
            }
        }

        if (event.keyCode == 13) {
            //enter key
            console.log('enter on item');
            var targetIndex = this.state.selectedIndex;
            if (targetIndex > -1) {
                var variant = this.state.variantList[targetIndex];
                this.props.itemAddCallback(variant);
            }
        }
    },
    converter: function converter(data) {
        var result = $.map(data, function (item) {
            return { id: item.no, text: item.name };
        });

        return result;
    },
    itemClickHandler: function itemClickHandler(variant) {
        console.log('itemClickHandler variant:%O', variant);

        var targetIndex = this.state.variantList.findIndex(function (item) {
            return item.key == variant.key;
        });

        if (targetIndex > -1) {
            this.setState({
                selectedIndex: targetIndex
            });
        }

        this.props.itemAddCallback(variant);
    },
    unescapeHtml: function unescapeHtml(safe) {
        return safe.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#x27;/g, "'");
    },
    extractVariantList: function extractVariantList(products) {
        var variantList = [];
        var _this = this;
        if (products) {
            products.forEach(function (product, i) {
                if (product.variantList && product.variantList.length > 0) {
                    //product with variant

                    var imgUrl = '';
                    product.imageList.forEach(function (img) {
                        if (img.type == 'intro') {
                            imgUrl = img.url;
                        }
                    });

                    product.variantList.forEach(function (variant, ii) {
                        var name = product.name;

                        var variantName = _this.unescapeHtml(variant.option1);
                        if (variant.option2) {
                            variantName = variantName + ' ' + _this.unescapeHtml(variant.option2);
                        }
                        if (variant.option3) {
                            variantName = variantName + ' ' + _this.unescapeHtml(variant.option3);
                        }
                        name += '/' + variantName + '/';

                        var data = {
                            key: product.no + '-' + variant.no,
                            variantNo: variant.no,
                            productNo: product.no,
                            productName: name,
                            option1: variant.option1,
                            option2: variant.option2,
                            option3: variant.option3,
                            selectedQuantity: 1,
                            sku: variant.sku,
                            price: variant.price,
                            imgUrl: imgUrl
                        };

                        variantList.push(data);
                    });
                } else {
                    //product without variant

                    var name = product.name;

                    var imgUrl = '';
                    product.imageList.forEach(function (img) {
                        if (img.type == 'intro') {
                            imgUrl = img.url;
                        }
                    });

                    var data = {
                        key: product.no + '-0',
                        variantNo: 0,
                        productNo: product.no,
                        productName: name,
                        option1: null,
                        option2: null,
                        option3: null,
                        selectedQuantity: 1,
                        sku: product.cd,
                        price: product.price,
                        imgUrl: imgUrl
                    };

                    variantList.push(data);
                }
            });
        }

        return variantList;
    },
    searchCallBack: function searchCallBack(filterText) {
        if (filterText) {
            $.ajax({
                url: 'http://merchant.jurur.mn/api/products?sellerNo=1&limit=30&title=' + filterText,
                dataType: 'json',
                cache: false,
                success: function (data) {
                    if (data.error_code == 1000) {
                        var variantList = this.extractVariantList(data.products);
                        this.setState({ products: data.products, variantList: variantList, selectedIndex: -1 });
                    } else {
                        alert(data.message);
                        console.error('error:%O', data);
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    alert('серветэй холбогдоход алдаа гарлаа');
                    console.error(url, status, err.toString());
                }.bind(this)
            });
        } else {
            this.setState({ products: [], variantList: [], selectedIndex: -1 });
        }
    },
    render: function render() {
        var productItemList = [];

        this.state.variantList.forEach(function (variant, i) {
            var isSelected = false;
            if (this.state.selectedIndex == i) {
                isSelected = true;
            }

            var refName = "product-item-" + i;
            /*console.log(refName);*/
            productItemList.push(React.createElement(ProductItem, { variant: variant, key: variant.key, ref: refName, itemClickCallback: this.itemClickHandler, isSelected: isSelected }));
        }.bind(this));

        return React.createElement(
            'div',
            { onKeyDown: this.handleKeyDown, onClick: this.handleClick },
            React.createElement(
                'div',
                { className: 'mm-pos-search-input' },
                React.createElement(SearchInput, { searchCallBack: this.searchCallBack, reset: this.props.reset })
            ),
            React.createElement(
                'div',
                { className: 'mm-pos-search-result', tabIndex: '1', ref: function (div) {
                        this.rootDiv = div;
                    }.bind(this) },
                productItemList
            )
        );
    }
});
//# sourceMappingURL=pos-search.js.map
