export class Game {
    constructor(canvas, grid_size, editable) {
        this.game = canvas;
        this.game_ctx = this.game.getContext('2d');
        this.game_rect = this.game.getBoundingClientRect();
        // get canvas dimensions
        this.x_max = this.game.width;
        this.y_max = this.game.height;

        this.grid_size = grid_size;
        this.editable = editable;
        this.mouse_field_index = [0, 0];
        this.generation = 0;
        this.running = false;

        // calc constants
        this.x_coord_max = this.x_max / this.grid_size;
        this.y_coord_max = this.y_max / this.grid_size;

        this.cell_array = new Array(this.x_coord_max);
        this.clear_game();
    }

    draw_grid() {
        this.game_ctx.beginPath();
        // draw horizontal lines
        for (let i = 0; i < this.x_coord_max; i++) {
            this.game_ctx.moveTo(this.grid_size*i, 0);
            this.game_ctx.lineTo(this.grid_size*i, this.y_max);
        }
        // draw vertical lines
        for (let j = 0; j < this.y_coord_max; j++) {
            this.game_ctx.moveTo(0, this.grid_size*j);
            this.game_ctx.lineTo(this.x_max, this.grid_size*j);
        }
        this.game_ctx.globalAlpha = 0.2;
        this.game_ctx.stroke();
    }

    get_mouse_coords(client_x, client_y) {
        const mouse_x = Math.round(client_x - this.game_rect.left);
        const mouse_y = Math.round(client_y - this.game_rect.top);

        return [mouse_x, mouse_y];
    }

    calc_field_index_from_coords(mouse_coords) {
        let index_x = Math.floor(mouse_coords[0] / this.grid_size);
        let index_y = Math.floor(mouse_coords[1] / this.grid_size);

        if (index_x >= this.x_coord_max) {
            index_x = this.x_coord_max - 1;
        }
        if (index_y >= this.y_coord_max) {
            index_y = this.y_coord_max - 1;
        }

        return [index_x, index_y];
    }

    show_placeable_cell(mouse_coords) {
        // get field index
        const old_mouse_field_index = this.mouse_field_index;
        this.mouse_field_index = this.calc_field_index_from_coords(mouse_coords);

        if (old_mouse_field_index[0] !== this.mouse_field_index[0] || old_mouse_field_index[1] !== this.mouse_field_index[1]) {
            // mouse moved to another index
            if (!this.cell_array[old_mouse_field_index[1]][old_mouse_field_index[0]]) {
                // if no cell is placed, clear old field
                this.clear_cell(old_mouse_field_index[0], old_mouse_field_index[1]);
            } else {
                // display cell again
                this.draw_cell(old_mouse_field_index[0], old_mouse_field_index[1], '#000000', 1);
            }
            // new field - calc rect
            this.draw_cell(this.mouse_field_index[0], this.mouse_field_index[1], '#000000', 0.4);
        }
    }

    edit_cell(mouse_coords) {
        const cell_index = this.calc_field_index_from_coords(mouse_coords);
        
        if (this.cell_array[cell_index[1]][cell_index[0]]) {
            // cell already placed
            // disable cell
            this.cell_array[cell_index[1]][cell_index[0]] = false;
        } else {
            // set cell
            this.cell_array[cell_index[1]][cell_index[0]] = true;
        }
    }

    draw_cell(x, y, color, alpha) {
        this.game_ctx.beginPath();
        this.game_ctx.rect(this.grid_size * x + 1, this.grid_size * y + 1, this.grid_size - 2, this.grid_size - 2);
        this.game_ctx.globalAlpha = alpha;
        this.game_ctx.fillStyle = color;
        this.game_ctx.fill();
    }

    clear_cell(x, y) {
        this.game_ctx.beginPath();
        this.game_ctx.clearRect(this.grid_size * x + 1, this.grid_size * y + 1, this.grid_size - 2, this.grid_size - 2);
    }

    render() {
        for (let y = 0; y < this.cell_array.length; y++) {
            for (let x = 0; x < this.cell_array[y].length; x++) {
                if (this.cell_array[y][x]) {
                    // cell found
                    this.draw_cell(x, y, '#000000', 1);
                } else {
                    // empty field
                    this.clear_cell(x, y);
                }
            }
        }
        this.draw_cell(this.mouse_field_index[0], this.mouse_field_index[1], '#000000', 0.4);
    }

    calc_next_generation() {
        const next_gen = new Array(this.x_coord_max);
        let is_alive = false;

        for (let y = 0; y < this.cell_array.length; y++) {
            next_gen[y] = [...this.cell_array[y]];

            for (let x = 0; x < this.cell_array[y].length; x++) {
                    const neighbours = this.count_living_neighbours(x, y);

                    if (neighbours < 2) {
                        // dead
                        next_gen[y][x] = false;
                    } else if (neighbours === 3) {
                        // reborn
                        is_alive = true;
                        next_gen[y][x] = true;
                    } else if (neighbours === 2 || neighbours === 3) {
                        // stays alive
                        is_alive = true;
                    } else if (neighbours > 3) {
                        // dead
                        next_gen[y][x] = false;
                    } else {
                        console.log('mutant cell detected: ' + x + ', ' + 'y');
                    }
            }
        }

        this.cell_array = next_gen;
        this.generation++;

        if (!is_alive) {
            this.running = false;
        }

        return is_alive;
    }

    count_living_neighbours(index_x, index_y) {
        let counter = 0;

        for (let y = index_y - 1; y < index_y + 2; y++) {
            for (let x = index_x - 1; x < index_x + 2; x++) {
                if (x === index_x && y === index_y) {
                    // skip investigating cell
                    continue;
                }

                if (x < 0) {
                    x = this.x_coord_max - 1;
                    index_x = this.x_coord_max;
                }
                if (y < 0) {
                    y = this.y_coord_max - 1;
                    index_y = this.y_coord_max;
                }
                if (this.cell_array[y % this.y_coord_max][x % this.x_coord_max]) {
                    counter++;
                }
            }
        }
        return counter;
    }

    end_evolution() {
        this.running = false;
        this.generation = 0;
    }

    clear_game() {
        for (let i = 0; i < this.cell_array.length; i++) {
            this.cell_array[i] = new Array(this.y_coord_max);
            // init array
            for (let j = 0; j < this.y_coord_max; j++) {
                this.cell_array[i][j] = false;
            }
        }
    }
}