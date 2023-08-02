import * as React from 'react';

type WindowSize = {
	width: number;
	height: number;
};

/**
 * Create a React Hook that retrieves the current window size.
 * @returns {WindowSize} A object with the width and height of the window
 */
function useWindowSize(): WindowSize {
	const [windowSize, setWindowSize] = React.useState<WindowSize>({
		width: 0,
		height: 0,
	});

	React.useEffect(() => {
		function handleWindowResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		handleWindowResize();

		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, []);

	return windowSize;
}

type MousePosition = {
	x: number;
	y: number;
};

/**
 * Create a React Hook that retrieves the current mouse position.
 * @returns {MousePosition} A object with the x and y position of the mouse
 */
function useMouse(): MousePosition {
	const [mousePosition, setMousePosition] = React.useState<MousePosition>({
		x: 0,
		y: 0,
	});

	React.useEffect(() => {
		function handleMouseMovement(event: MouseEvent) {
			setMousePosition({ x: event.clientX, y: event.clientY });
		}
		window.addEventListener('mousemove', handleMouseMovement);

		return () => {
			window.removeEventListener('mousemove', handleMouseMovement);
		};
	}, []);

	return mousePosition;
}

/**
 * Create a React Hook that retrieves a item inside Local Storage or create one. On change update Local Storage item.
 * @param {string} key String with the localStorage key
 * @param {string} initial The initial value of the localStorage if it doesn't exist.
 * @returns {[string, Dispatch<SetStateAction<string>>]} An array with the state containing the data of the localStorage, along with a function to change it
 */
function useLocalStorage(
	key: string,
	initial: string
): [string, React.Dispatch<React.SetStateAction<string>>] {
	const [data, setData] = React.useState(() => {
		const local = window.localStorage.getItem(key);
		return local ? local : initial;
	});

	React.useEffect(() => {
		window.localStorage.setItem(key, data);
	}, [key, data]);

	return [data, setData];
}

/**
 * Create a React Hook that listens to keyboard actions and executes a function defined through the params.
 * @param {KeyboardEvent} eventHandler Function that receive the KeyboardEvent and do some logic
 */
function useKeyboard(eventHandler: (event: KeyboardEvent) => void) {
	React.useEffect(() => {
		window.addEventListener('keydown', eventHandler);

		return () => window.removeEventListener('keydown', eventHandler);
	});
}

/**
 * Create a React Hook that return a boolean state and a function to change the state.
 * @param {boolean} defaultValue The default value of the boolean state
 * @returns {[boolean, (value:boolean) => void]} An array with the state containing the boolean value, along with a function to change it
 */
function useToggle(defaultValue: boolean): [boolean, (value: boolean) => void] {
	const [toggle, setToggle] = React.useState(defaultValue);

	function changeToggle(value: boolean | null) {
		setToggle((prev) => (typeof value === 'boolean' ? value : !prev));
	}

	return [toggle, changeToggle];
}

/**
 * Create a timeout that executes a function after a delay. Can be reset or cleared
 * @param {any} callback Function to be executed after timeout
 * @param {any} delay Delay for the function execution
 * @returns {object} A object with the reset and clear functions
 */
function useTimeout(callback: () => void, delay: number): { reset: () => void; clear: () => void } {
	const callbackRef = React.useRef(callback);
	const timeoutRef = React.useRef<NodeJS.Timeout>();

	React.useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	const set = React.useCallback(() => {
		timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
	}, [delay]);

	const clear = React.useCallback(() => {
		timeoutRef.current && clearTimeout(timeoutRef.current);
	}, []);

	React.useEffect(() => {
		set();
		return clear;
	}, [delay, set, clear]);

	const reset = React.useCallback(() => {
		clear();
		set();
	}, [clear, set]);

	return { reset, clear };
}

/**
 * Create a useTimeout function that is reset after the dependencies are reset
 * @param {() => void} callback Function to be executed after some delay over dependencies
 * @param {number} delay Delay for the function execution
 * @param {any} dependencies Dependencies that reset the delay timer
 */
function useDelay(callback: () => void, delay: number, dependencies: any[]) {
	const { reset, clear } = useTimeout(callback, delay);
	React.useEffect(reset, [...dependencies, reset]);
	React.useEffect(clear, []);
}

/**
 * Execute a function from the first update of a value in dependencies
 * @param {any} callback Function to be executed after some delay over dependencies
 * @param {any} dependencies Dependencies that reset the delay timer
 */
function useUpdateEffect(callback: () => void, dependencies: any[]): void {
	const isFirstRender = React.useRef(true);

	React.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		return callback();
	}, dependencies);
}

type ArrayControl = {
	clear: () => void;
	push: (value: any) => void;
	remove: (index: number) => void;
	update: (index: number, value: any) => void;
	filter: (filter: () => boolean) => void;
};
/**
 * A Better way to create a piece of state with a array
 * @param {any[]} defaultValue The default array model
 * @returns {[any[], ArrayControl]} Return a state of an array and an object to modify it
 */
function useArray(defaultValue?: any[]): [any[], ArrayControl] {
	const [array, setArray] = React.useState(defaultValue ? defaultValue : []);

	const arrayControl: ArrayControl = {
		clear: () => setArray([]),
		push: (value: any) => setArray((prev) => [...prev, value]),
		remove: (index: number) => {
			setArray((prev) => [...prev.slice(0, index), ...prev.slice(index + 1, prev.length - 1)]);
		},
		update: (index: number, value: any) => {
			setArray((prev) => [...prev.slice(0, index), value, ...prev.slice(index + 1, prev.length - 1)]);
		},
		filter: (filter: () => boolean) => setArray((prev) => prev.filter(filter)),
	};

	return [array, arrayControl];
}

export {
	useMouse,
	useWindowSize,
	useLocalStorage,
	useKeyboard,
	useToggle,
	useTimeout,
	useDelay,
	useUpdateEffect,
	useArray,
};