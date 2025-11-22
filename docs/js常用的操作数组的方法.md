# js常用的操作数组的方法

JavaScript 中数组是常用的数据结构，有许多内置方法可以方便地操作数组。以下是一些常用的数组方法：

### 1. 增删元素
- `push(element1, ..., elementN)`：向数组末尾添加一个或多个元素，返回新的长度。
  ```javascript
  const arr = [1, 2];
  arr.push(3); // arr 变为 [1, 2, 3]
  ```

- `pop()`：删除并返回数组的最后一个元素。
  ```javascript
  const arr = [1, 2, 3];
  arr.pop(); // 返回 3，arr 变为 [1, 2]
  ```

- `unshift(element1, ..., elementN)`：向数组开头添加一个或多个元素，返回新的长度。
  ```javascript
  const arr = [2, 3];
  arr.unshift(1); // arr 变为 [1, 2, 3]
  ```

- `shift()`：删除并返回数组的第一个元素。
  ```javascript
  const arr = [1, 2, 3];
  arr.shift(); // 返回 1，arr 变为 [2, 3]
  ```

- `splice(start, deleteCount, item1, ..., itemN)`：从指定位置删除元素，并可添加新元素，返回被删除的元素数组。
  ```javascript
  const arr = [1, 2, 3, 4];
  arr.splice(1, 2, 5); // 从索引1开始删除2个元素，添加5，arr变为[1,5,4]
  ```


### 2. 数组遍历与转换
- `forEach(callback)`：对数组每个元素执行回调函数，无返回值。
  ```javascript
  [1, 2, 3].forEach(item => console.log(item)); // 依次打印 1、2、3
  ```

- `map(callback)`：对每个元素执行回调，返回新数组（元素为回调返回值）。
  ```javascript
  const doubled = [1, 2, 3].map(item => item * 2); // [2, 4, 6]
  ```

- `filter(callback)`：返回满足回调条件（返回`true`）的元素组成的新数组。
  ```javascript
  const evens = [1, 2, 3, 4].filter(item => item % 2 === 0); // [2, 4]
  ```

- `reduce(callback, initialValue)`：通过回调将数组元素累积为一个值。
  ```javascript
  const sum = [1, 2, 3].reduce((acc, item) => acc + item, 0); // 6
  ```


### 3. 查找元素
- `find(callback)`：返回第一个满足回调条件的元素，无则返回`undefined`。
  ```javascript
  const found = [1, 2, 3].find(item => item > 1); // 2
  ```

- `findIndex(callback)`：返回第一个满足条件的元素索引，无则返回`-1`。
  ```javascript
  const index = [1, 2, 3].findIndex(item => item > 1); // 1
  ```

- `includes(value)`：判断数组是否包含指定值，返回布尔值。
  ```javascript
  [1, 2, 3].includes(2); // true
  ```

- `indexOf(value)`：返回指定值在数组中首次出现的索引，无则返回`-1`。
  ```javascript
  [1, 2, 3, 2].indexOf(2); // 1
  ```


### 4. 数组排序与反转
- `sort(compareFunction)`：对数组元素排序，默认按字符串Unicode码排序（会修改原数组）。
  ```javascript
  [3, 1, 2].sort((a, b) => a - b); // [1, 2, 3]（升序）
  ```

- `reverse()`：反转数组元素顺序（修改原数组）。
  ```javascript
  [1, 2, 3].reverse(); // [3, 2, 1]
  ```


### 5. 数组拼接与截取
- `concat(array1, ..., arrayN)`：合并多个数组，返回新数组。
  ```javascript
  [1, 2].concat([3, 4]); // [1, 2, 3, 4]
  ```

- `slice(start, end)`：截取从`start`到`end`（不包含`end`）的元素，返回新数组。
  ```javascript
  [1, 2, 3, 4].slice(1, 3); // [2, 3]
  ```


### 6. 其他常用方法
- `join(separator)`：将数组元素以指定分隔符拼接为字符串。
  ```javascript
  [1, 2, 3].join('-'); // "1-2-3"
  ```

- `every(callback)`：检测所有元素是否满足回调条件，返回布尔值。
  ```javascript
  [2, 4, 6].every(item => item % 2 === 0); // true
  ```

- `some(callback)`：检测是否有至少一个元素满足回调条件，返回布尔值。
  ```javascript
  [1, 3, 4].some(item => item % 2 === 0); // true（因为有4）
  ```

这些方法覆盖了数组的大部分操作场景，合理使用可以简化代码并提高效率。