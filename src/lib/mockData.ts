import { Organization, Route, Bus, Student, Staff, Assignment, Seat, SeatLayoutType } from './types';

// Helper to generate seats for bus layout
export function generateSeatsForLayout(layoutType: SeatLayoutType, rows: number, startSeatNum: number = 1): Seat[] {
  const seats: Seat[] = [];
  let currentNum = startSeatNum;

  // Layout configurations:
  // '2x2': col 1, 2 (left), aisle, col 3, 4 (right)
  // '2x3': col 1, 2 (left), aisle, col 3, 4, 5 (right)
  // '3x2': col 1, 2, 3 (left), aisle, col 4, 5 (right)
  const colsPerRow = layoutType === '2x3' || layoutType === '3x2' ? 5 : 4;

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= colsPerRow; c++) {
      const seatNumStr = String(currentNum).padStart(2, '0');
      seats.push({
        id: `seat-${r}-${c}-${currentNum}`,
        seatNumber: seatNumStr,
        row: r,
        column: c,
        status: 'available',
      });
      currentNum++;
    }
  }

  // Add 1 or 2 back row seats across the aisle if needed, or leave clean rectangular
  return seats;
}

export function generateMockData() {
  const organization: Organization = {
    id: 'org-1',
    name: 'VR Siddhartha Engineering College',
    code: 'VRSEC',
    contactEmail: 'transport.admin@vrsec.ac.in',
    academicYear: '2024-2025'
  };

  // 4 Realistic Routes around Guntur, Vijayawada, Tenali, Mangalagiri
  const routes: Route[] = [
    {
      id: 'route-1',
      name: 'Guntur → College Campus',
      startPoint: 'Guntur RTC Bus Stand',
      endPoint: 'VRSEC Campus Gate',
      isActive: true,
      stops: [
        { id: 'stop-101', name: 'Guntur RTC Complex', landmark: 'Opp. Platform 1 Gate', pickupTime: '06:45 AM', dropTime: '05:30 PM', order: 1 },
        { id: 'stop-102', name: 'Lakshmipuram Main Circle', landmark: 'Near Reliance Digital', pickupTime: '07:00 AM', dropTime: '05:15 PM', order: 2 },
        { id: 'stop-103', name: 'Brodipet 4th Line', landmark: 'Near Sri Chaitanya School', pickupTime: '07:12 AM', dropTime: '05:00 PM', order: 3 },
        { id: 'stop-104', name: 'Nallapadu Centre', landmark: 'Indian Oil Petrol Pump', pickupTime: '07:25 AM', dropTime: '04:45 PM', order: 4 },
        { id: 'stop-105', name: 'Autonagar Junction', landmark: 'Opp. Hero Showroom', pickupTime: '07:40 AM', dropTime: '04:30 PM', order: 5 },
        { id: 'stop-106', name: 'VRSEC Campus Terminal', landmark: 'Main Admin Porch', pickupTime: '07:55 AM', dropTime: '04:15 PM', order: 6 },
      ]
    },
    {
      id: 'route-2',
      name: 'Vijayawada City → College Campus',
      startPoint: 'Benz Circle',
      endPoint: 'VRSEC Campus Gate',
      isActive: true,
      stops: [
        { id: 'stop-201', name: 'Benz Circle Flyover', landmark: 'Near Trendset Mall', pickupTime: '07:05 AM', dropTime: '05:10 PM', order: 1 },
        { id: 'stop-202', name: 'Patamata High School', landmark: 'Main Road Bus Bay', pickupTime: '07:15 AM', dropTime: '05:00 PM', order: 2 },
        { id: 'stop-203', name: 'Autonagar Gate', landmark: 'Near Kanakadurga Weighbridge', pickupTime: '07:25 AM', dropTime: '04:50 PM', order: 3 },
        { id: 'stop-204', name: 'Poranki Centre', landmark: 'Opp. State Bank of India', pickupTime: '07:35 AM', dropTime: '04:40 PM', order: 4 },
        { id: 'stop-205', name: 'Penamaluru Center', landmark: 'Near ZP High School', pickupTime: '07:45 AM', dropTime: '04:30 PM', order: 5 },
        { id: 'stop-206', name: 'VRSEC Campus Terminal', landmark: 'Main Admin Porch', pickupTime: '07:55 AM', dropTime: '04:15 PM', order: 6 },
      ]
    },
    {
      id: 'route-3',
      name: 'Tenali → College Campus',
      startPoint: 'Tenali Railway Station',
      endPoint: 'VRSEC Campus Gate',
      isActive: true,
      stops: [
        { id: 'stop-301', name: 'Tenali Station Road', landmark: 'Opp. Railway Outpost', pickupTime: '06:40 AM', dropTime: '05:35 PM', order: 1 },
        { id: 'stop-302', name: 'Morrispet Circle', landmark: 'Near Gandhi Statue', pickupTime: '06:55 AM', dropTime: '05:20 PM', order: 2 },
        { id: 'stop-303', name: 'Nandivelugu Village', landmark: 'Panchayat Office', pickupTime: '07:15 AM', dropTime: '05:00 PM', order: 3 },
        { id: 'stop-304', name: 'Duggirala Canal Bridge', landmark: 'Near Market Yard', pickupTime: '07:30 AM', dropTime: '04:45 PM', order: 4 },
        { id: 'stop-305', name: 'Kankipadu Centre', landmark: 'Near Police Station', pickupTime: '07:45 AM', dropTime: '04:30 PM', order: 5 },
        { id: 'stop-306', name: 'VRSEC Campus Terminal', landmark: 'Main Admin Porch', pickupTime: '08:00 AM', dropTime: '04:15 PM', order: 6 },
      ]
    },
    {
      id: 'route-4',
      name: 'Mangalagiri → College Campus',
      startPoint: 'Mangalagiri Bypass',
      endPoint: 'VRSEC Campus Gate',
      isActive: true,
      stops: [
        { id: 'stop-401', name: 'Mangalagiri AIIMS Gate', landmark: 'Service Road Bay', pickupTime: '07:10 AM', dropTime: '05:15 PM', order: 1 },
        { id: 'stop-402', name: 'Tadepalli Old Tollgate', landmark: 'Near Mahanadu Road', pickupTime: '07:22 AM', dropTime: '05:00 PM', order: 2 },
        { id: 'stop-403', name: 'Kanaka Durga Varadhi', landmark: 'South Ramp', pickupTime: '07:32 AM', dropTime: '04:50 PM', order: 3 },
        { id: 'stop-404', name: 'Ramavarappadu Ring', landmark: 'Under Flyover Junction', pickupTime: '07:42 AM', dropTime: '04:35 PM', order: 4 },
        { id: 'stop-405', name: 'VRSEC Campus Terminal', landmark: 'Main Admin Porch', pickupTime: '07:55 AM', dropTime: '04:15 PM', order: 5 },
      ]
    }
  ];

  // 5 Realistic Andhra Pradesh buses with layout presets
  const busConfigs = [
    {
      id: 'bus-1',
      busNumber: 'BUS-01',
      registrationNumber: 'AP16 AB 1234',
      name: 'Amaravati Express',
      layoutType: '2x3' as SeatLayoutType,
      rows: 10, // 50 seats
      routeId: 'route-1',
      status: 'active' as const
    },
    {
      id: 'bus-2',
      busNumber: 'BUS-02',
      registrationNumber: 'AP16 AB 2789',
      name: 'Krishna Express',
      layoutType: '2x2' as SeatLayoutType,
      rows: 12, // 48 seats
      routeId: 'route-2',
      status: 'active' as const
    },
    {
      id: 'bus-3',
      busNumber: 'BUS-03',
      registrationNumber: 'AP07 CX 4512',
      name: 'Guntur Deluxe',
      layoutType: '2x3' as SeatLayoutType,
      rows: 8, // 40 seats
      routeId: 'route-1',
      status: 'active' as const
    },
    {
      id: 'bus-4',
      busNumber: 'BUS-04',
      registrationNumber: 'AP16 TC 9801',
      name: 'Tenali Shuttle',
      layoutType: '2x2' as SeatLayoutType,
      rows: 11, // 44 seats
      routeId: 'route-3',
      status: 'active' as const
    },
    {
      id: 'bus-5',
      busNumber: 'BUS-05',
      registrationNumber: 'AP07 BX 3320',
      name: 'Mangala Link',
      layoutType: '3x2' as SeatLayoutType,
      rows: 10, // 50 seats
      routeId: 'route-4',
      status: 'active' as const
    }
  ];

  const buses: Bus[] = busConfigs.map(cfg => {
    const seats = generateSeatsForLayout(cfg.layoutType, cfg.rows);
    return {
      id: cfg.id,
      busNumber: cfg.busNumber,
      registrationNumber: cfg.registrationNumber,
      name: cfg.name,
      capacity: seats.length,
      status: cfg.status,
      routeId: cfg.routeId,
      seatLayout: {
        layoutType: cfg.layoutType,
        rows: cfg.rows,
        seats: seats
      },
      isActive: true
    };
  });

  // Students & Staff Data Generation
  const students: Student[] = [];
  const staff: Staff[] = [];
  const assignments: Assignment[] = [];

  const firstNamesM = [
    'Rahul', 'Sai', 'Kiran', 'Venkat', 'Suresh', 'Akhil', 'Chaitanya', 'Praveen', 
    'Naveen', 'Teja', 'Harsha', 'Manoj', 'Rohit', 'Karthik', 'Tarun', 'Anand',
    'Vamsi', 'Prasad', 'Sanjay', 'Ganesh', 'Jagadish', 'Bhanu', 'Sridhar', 'Nikhil'
  ];
  const firstNamesF = [
    'Pooja', 'Sneha', 'Ananya', 'Divya', 'Bhavana', 'Harika', 'Keerthi', 'Mounika', 
    'Sireesha', 'Deepika', 'Kavya', 'Sravani', 'Yamini', 'Swathi', 'Tejaswini', 'Pavani',
    'Lavanya', 'Manasa', 'Roopa', 'Sandhya', 'Meghana', 'Pranitha', 'Aparna', 'Chandana'
  ];
  const surnames = [
    'Chowdary', 'Reddy', 'Rao', 'Naidu', 'Varma', 'Sharma', 'Kollipara', 'Gudivada', 
    'Bodapati', 'Maddipati', 'Yalamanchili', 'Nalluri', 'Kanneganti', 'Koneru', 'Gadde', 
    'Potluri', 'Daggubati', 'Garlapati', 'Mandava', 'Atluri', 'Chalasani', 'Vemuri'
  ];
  const branches = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE', 'AIDS', 'CSBS'];

  // Create 88 Students
  for (let i = 0; i < 88; i++) {
    const isMale = i % 2 === 0;
    const fName = isMale ? firstNamesM[i % firstNamesM.length] : firstNamesF[i % firstNamesF.length];
    const sName = surnames[(i * 3 + 1) % surnames.length];
    const branch = branches[i % branches.length];
    const year = (i % 4) + 1;
    const studentId = `2${4 - year + 1}${branch}${String(1001 + i).slice(-4)}`;

    students.push({
      id: `stu-${i + 1}`,
      studentId: studentId,
      name: `${fName} ${sName}`,
      gender: isMale ? 'M' : 'F',
      course: 'B.Tech',
      branch: branch,
      year: year,
      phone: `+91 9848${String(100000 + i).slice(1)}`,
      parentName: `${surnames[(i + 4) % surnames.length]} ${firstNamesM[(i + 7) % firstNamesM.length]}`,
      parentPhone: `+91 9440${String(200000 + i).slice(1)}`,
      status: 'active'
    });
  }

  // Create 14 Staff members
  const departments = ['Computer Science', 'Electronics & Comm.', 'Information Tech.', 'Mechanical Engg.', 'Mathematics', 'Administrative Office'];
  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Sr. Lab Instructor', 'System Administrator', 'Office Superintendent'];

  for (let i = 0; i < 14; i++) {
    const isMale = i % 2 !== 0;
    const fName = isMale ? firstNamesM[(i + 10) % firstNamesM.length] : firstNamesF[(i + 10) % firstNamesF.length];
    const sName = surnames[(i * 2 + 5) % surnames.length];

    staff.push({
      id: `staff-${i + 1}`,
      employeeId: `EMP${String(201 + i)}`,
      name: `Dr. ${fName} ${sName}`,
      gender: isMale ? 'M' : 'F',
      department: departments[i % departments.length],
      designation: designations[i % designations.length],
      phone: `+91 9849${String(300000 + i).slice(1)}`,
      status: 'active'
    });
  }

  // Pre-assign students and staff to buses with realistic seatings
  let assignmentCounter = 1;

  // Let's populate:
  // Bus 1 (50 seats) -> 43 assigned (38 students, 5 staff)
  // Bus 2 (48 seats) -> 39 assigned (35 students, 4 staff)
  // Bus 3 (40 seats) -> 26 assigned (23 students, 3 staff)
  // Bus 4 (44 seats) -> 32 assigned (30 students, 2 staff)
  // Bus 5 (50 seats) -> 0 assigned (clean for assignment walkthrough)

  const busAllocations = [
    { busIndex: 0, studentCount: 38, staffIndices: [0, 1, 2, 3, 4] },
    { busIndex: 1, studentCount: 28, staffIndices: [5, 6, 7, 8] },
    { busIndex: 2, studentCount: 12, staffIndices: [9, 10] },
    { busIndex: 3, studentCount: 8, staffIndices: [11] }
  ];

  let studentPointer = 0;

  busAllocations.forEach(alloc => {
    const bus = buses[alloc.busIndex];
    const route = routes.find(r => r.id === bus.routeId) || routes[0];
    const availableSeats = bus.seatLayout.seats;
    let seatIndex = 0;

    // Assign Students
    for (let s = 0; s < alloc.studentCount && studentPointer < students.length; s++) {
      const student = students[studentPointer++];
      const seat = availableSeats[seatIndex++];
      if (!seat) break;

      // Pickup stops distributed among route intermediate stops
      const intermediateStops = route.stops.slice(0, route.stops.length - 1);
      const pickupStop = intermediateStops[s % intermediateStops.length];
      const dropStop = route.stops[route.stops.length - 1]; // College Campus Terminal

      seat.status = 'assigned';
      seat.passengerId = student.id;

      assignments.push({
        id: `asg-${assignmentCounter++}`,
        passengerId: student.id,
        passengerType: 'student',
        busId: bus.id,
        routeId: route.id,
        seatId: seat.id,
        pickupStopId: pickupStop.id,
        dropStopId: dropStop.id,
        status: 'active',
        assignedAt: new Date(Date.now() - (s * 3600000 * 24)).toISOString()
      });
    }

    // Assign Staff
    alloc.staffIndices.forEach((staffIdx, sIdx) => {
      const staffMember = staff[staffIdx];
      if (!staffMember) return;
      const seat = availableSeats[seatIndex++];
      if (!seat) return;

      const intermediateStops = route.stops.slice(0, route.stops.length - 1);
      const pickupStop = intermediateStops[sIdx % intermediateStops.length];
      const dropStop = route.stops[route.stops.length - 1];

      seat.status = 'assigned';
      seat.passengerId = staffMember.id;

      assignments.push({
        id: `asg-${assignmentCounter++}`,
        passengerId: staffMember.id,
        passengerType: 'staff',
        busId: bus.id,
        routeId: route.id,
        seatId: seat.id,
        pickupStopId: pickupStop.id,
        dropStopId: dropStop.id,
        status: 'active',
        assignedAt: new Date(Date.now() - (sIdx * 3600000 * 36)).toISOString()
      });
    });
  });

  return { organization, routes, buses, students, staff, assignments };
}

