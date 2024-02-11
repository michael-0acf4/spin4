use spin4::{mat::{rot_plane, Axis}, system::System};


fn main() {
    let mut system = System::new();
    system.apply(rot_plane(Axis::X, Axis::Y, false).unwrap());
    println!("{:?}", system.active_plane_signature());
    system.display();
}
