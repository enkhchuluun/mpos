var PosFactory = React.createFactory(Pos);

ReactDOM.render(
    PosFactory({branchName:"Center"}),
    document.getElementById('posWrapper')
);