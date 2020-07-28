
export function computeNewBarValue(clickedIndex, currentValue, min, max) {
    // Get the type of item to create.
    const index = Number(clickedIndex);
    // Grab any data associated with this control.
    let targetIndex = index;
    // cover the case of filling up the bar completely.
    if (targetIndex >= currentValue) {
        targetIndex += 1;
    }
    return Math.max(min, Math.min(max, targetIndex));
}

export function onHoverBarSegmentIn(target, currentValue, barClass, segmentClass) {
    // Get the type of item to create.
    const hoverIndex = Number(target.dataset.index);
    let increase = hoverIndex >= currentValue;
    let barElement = $(target).parents(barClass);
    barElement.find(segmentClass).each((i, div) => {
        let bar = $(div);
        const increaseClass = 'hover-to-increase';
        const decreaseClass = 'hover-to-decrease';
        bar.removeClass(increaseClass);
        bar.removeClass(decreaseClass);
        // only alter the bars that are empty between the end of our 'filled' bars
        // and our hover index
        if (increase && i <= hoverIndex && i >= currentValue) {
            bar.addClass(increaseClass);
        }

        // only alter bars that are filled between the end of our 'filled bars'
        // and our hover index
        if (!increase && i >= hoverIndex && i < currentValue) {
            bar.addClass(decreaseClass);
        }
    });
}

export function onHoverBarOut(target, segmentClass) {
    $(target).find(segmentClass).each((i, div) => {
        let bar = $(div);
        bar.removeClass('hover-to-increase');
        bar.removeClass('hover-to-decrease');
    });

}