/**
 * @author:	Emmanuel SMITH <hey@emmanuel-smith.me>
 * project:	ets2-map-view
 * file: 	app.utils.js
 * Date: 	26/04/2022
 * Time: 	20:28
 */

export const betweenFloat = (data, a, b) => {
  return greaterOrEqualThanFloat(data, a) && lessOrEqualThanFloat(data, b);
};

export const greaterOrEqualThanFloat = (data, a) => {
  return parseFloat(data) >= a;
};

export const lessOrEqualThanFloat = (data, a) => {
  return parseFloat(data) <= a;
};

export const log = (message, origin, level = 'SUCCESS') => {
  console.log(message, origin, level);
};
