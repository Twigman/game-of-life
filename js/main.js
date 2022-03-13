import { Game } from './game.js';

let canvas = document.getElementById('game');
const btn_start = document.getElementById('btn_start');
const btn_clear = document.getElementById('btn_clear');
const range_speed = document.getElementById('speed');
const range_generations = document.getElementById('generations');
const display_gen = document.getElementById('disp_gen');
const label_speed = document.getElementById('lbl_speed');
const label_gen = document.getElementById('lbl_gen');
let interval = null;

let game = new Game(canvas, 20, true);
game.draw_grid();

canvas.addEventListener('mousemove', e => {
    const mouse_coords = game.get_mouse_coords(e.clientX, e.clientY);
    game.show_placeable_cell(mouse_coords);
});

canvas.addEventListener('click', e => {
    const mouse_coords = game.get_mouse_coords(e.clientX, e.clientY);
    game.edit_cell(mouse_coords);
    game.render();
});

range_speed.addEventListener('input', e => {
    label_speed.innerHTML = 'Speed: ' + range_speed.value + ' ms';
    if (interval !== null) {
        window.clearInterval(interval);
    }
    if (game.running) {
        interval = setInterval(next_generation, range_speed.value);
    }
});

range_generations.addEventListener('input', e => {
    label_gen.innerHTML = 'Generations: ' + range_generations.value;
});

btn_start.addEventListener('click', e => {
    game.running = true;
    if (interval !== null) {
        window.clearInterval(interval);
        game.end_evolution();
    }
    interval = setInterval(next_generation, range_speed.value);
});

function next_generation() {
    let is_alive = game.calc_next_generation();
    game.render();
    display_gen.innerHTML = 'Generation: ' + game.generation;

    if (game.generation >= range_generations.value || !is_alive) {
        window.clearInterval(interval);
        game.end_evolution();
    }
}

btn_clear.addEventListener('click', e => {
    window.clearInterval(interval);
    game.end_evolution();
    display_gen.innerHTML = 'Generation: ' + game.generation;
    game.clear_game();
    game.render();
});