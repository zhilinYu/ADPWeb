
export const transformStatus = (obj, item) => {
  for (let i = 0; i < obj.length; i++) {
    if (obj[i].value === item) {
      return obj[i].label;
    }
  }
}


export const filterCategory = (data) => {
	for (let i = 0; i < data.length; i++) {
		let subData = data[i].children;
		// console.log('i=', i, data);

		if (data[i].children.length === 0) {
			// data.splice(i, 1);
			// i--;
			// continue;
		}
		for (let j = 0; j < subData.length; j++) {
			// console.log('j=', j);
			if (subData[j].children.length === 0) {
				// subData.splice(j, 1);
				// j--;
				// continue;
      } else {
        for (let m = 0; m < subData[j].children.length; m++) {
          delete subData[j].children[m].children;
        }
      }
		}
	}
	return data;
}