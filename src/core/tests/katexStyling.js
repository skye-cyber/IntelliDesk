setTimeout(() => {
    const items = document.querySelectorAll('.katex-display')
    //console.log(items)
    items.forEach(item => {
        //console.log('b4:', item.classList)
        item.classList.remove('katex-display')

        //console.log(item.classList)
    });
}, 1000);

setTimeout(() => {
    const items = document.querySelectorAll('.katex');
    items.forEach(item => {
        const parItem = item.parentNode.parentNode.parentElement;
        console.log(parItem)
        parItem.classList.add('p-4')
    })
}, 1000);
